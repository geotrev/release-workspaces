#!/usr/bin/env node

import semver from "semver"
import fs from "fs"
import glob from "glob"
import path from "path"
import { ROOT_PACKAGE_FILE } from "./constants.js"
import { exitWithError } from "./reporter.js"
import { configDefault } from "./config-default.js"

const cwd = process.cwd()
const ROOT_PACKAGE_PATH = path.resolve(cwd, ROOT_PACKAGE_FILE)

/**
 * Validate all pkg paths are contained in the current
 * repo. If not, kill the script.
 */
function validatePackagePaths(dir) {
  const dirs = process.cwd().split("/")
  const rootDirName = dirs[dirs.length - 1]

  if (dir.indexOf(rootDirName) === -1) {
    exitWithError(
      "Workspace directory(ies) are outside your current working directory."
    )
  }
}

/**
 * Sets default values back to the config object if config categories
 * are missing or incomplete.
 */
function normalizeConfigCategory(config, category) {
  const keys = config[category] ? Object.keys(config[category]) : []

  if (keys.length) {
    for (const key in configDefault[category]) {
      const configDefaultType = typeof configDefault[category][key]
      const configType = typeof config[category][key]

      if (configType === configDefaultType) continue

      if (configType === "undefined") {
        config[category][key] = configDefault[category][key]
        continue
      }

      exitWithError(
        `Invalid value given to config.${category}.${key}, expected ${configDefaultType}`
      )
    }
  } else {
    config[category] = configDefault[category]
  }
}

function createPackageMeta(pkgs, dir) {
  const pkgPath = path.resolve(dir, ROOT_PACKAGE_FILE)

  if (!fs.existsSync(pkgPath)) {
    exitWithError("Package root is missing package.json, unable to proceed")
  }

  const getPackage = () => JSON.parse(fs.readFileSync(pkgPath, "utf8"))
  const content = getPackage()

  return [
    ...pkgs,
    {
      getPackage,
      name: content.name,
      dir,
    },
  ]
}

export function normalizeConfig(config) {
  const rootPackage = JSON.parse(fs.readFileSync(ROOT_PACKAGE_PATH, "utf8"))

  // Set defaults

  const configCategories = Object.keys(configDefault)
  configCategories.forEach((entry) => normalizeConfigCategory(config, entry))

  // Get workspaces field

  const workspaces = rootPackage.workspaces

  if (!Array.isArray(workspaces)) {
    exitWithError("This repository doesn't appear to have workspaces.")
  } else {
    config.packages = workspaces
  }

  // Expand workspaces entries into a directory list.
  // E.g., replace wildcards with full directory paths.
  const packageRoots = config.packages.reduce((roots, root) => {
    const paths = glob.sync(path.resolve(cwd, root))
    return [...roots, ...paths]
  }, [])

  // Create new entries for each package to release
  config.packages = packageRoots.reduce(createPackageMeta, [])
  config.packageNames = config.packages.map((pkg) => pkg.name)

  // Validate packages are within the current repo root
  for (const pkg of config.packages) {
    validatePackagePaths(pkg.dir)
  }

  // Set the next version

  const prevVersion = config.metadata.version || rootPackage.version

  if (!prevVersion) {
    exitWithError(
      "No version defined in project root. Add a 'metadata.version' field to your config file or 'version' field to your root package.json to proceed."
    )
  }

  let releaseVersion

  if (config.npm.increment && config.incrementTo) {
    const isValidCustomIncrement =
      semver.valid(config.incrementTo) &&
      semver.gt(config.incrementTo, prevVersion)

    if (isValidCustomIncrement) {
      releaseVersion = config.incrementTo
    } else {
      exitWithError(
        `Custom version '${config.incrementTo}' is either not a string, an invalid semver string, or less than the existing version ('${prevVersion}').`
      )
    }
  } else if (config.npm.increment) {
    releaseVersion = semver.inc(prevVersion, config.increment, config.preid)
  } else {
    releaseVersion = prevVersion
  }

  if (!releaseVersion) {
    exitWithError(
      `Invalid version increment requested: ${
        config.incrementTo || config.increment
      }`
    )
  }

  config.releaseVersion = releaseVersion
  config.prevVersion = prevVersion
}

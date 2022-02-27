#!/usr/bin/env node

import semver from "semver"
import fs from "fs"
import glob from "glob"
import path from "path"
import { ROOT_PACKAGE_FILE } from "./constants.js"
import { exitWithError, reporter } from "./reporter.js"
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
    reporter.fail(
      `Workspace doesn't appear to exist in the current project: ${dir}`
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

      reporter.fail(
        `Invalid value given to config.${category}.${key}, expected ${configDefaultType}`
      )
      process.exit(1)
    }
  } else {
    config[category] = configDefault[category]
  }
}

function createPackageMeta(pkgs, dir) {
  const pkgPath = path.resolve(dir, ROOT_PACKAGE_FILE)

  if (!fs.existsSync(pkgPath)) {
    reporter.fail("Package root is missing package.json, unable to proceed")
    process.exit(1)
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
    reporter.fail("This repository doesn't appear to have workspaces.")
    process.exit(1)
  } else {
    config.packages = workspaces
  }

  // Create a complete list of workspace roots based on workspaces field entries
  // E.g., sometimes wild cards can be used to target all sub-directories.
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
    reporter.fail(
      "No version defined in project root. Add a 'version' field to config file or root package.json to proceed."
    )
    process.exit(1)
  }

  let releaseVersion

  if (config.incrementTo) {
    const isValidCustomIncrement =
      config.npm.increment &&
      semver.valid(config.incrementTo) &&
      semver.gt(config.incrementTo, prevVersion)

    if (isValidCustomIncrement) {
      releaseVersion = config.incrementTo
    } else {
      exitWithError(
        "Bad custom version",
        `Custom version '${config.incrementTo}' is either not a string, an invalid semver string, or less than the existing version ('${prevVersion}').`
      )
    }
  } else if (config.npm.increment) {
    releaseVersion = semver.inc(prevVersion, config.target, config.preid)
  } else {
    releaseVersion = prevVersion
  }

  if (!releaseVersion) {
    reporter.fail("Invalid target version requested")
    process.exit(1)
  }

  config.releaseVersion = releaseVersion
  config.prevVersion = prevVersion
}

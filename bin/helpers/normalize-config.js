#!/usr/bin/env node

import fs from "fs"
import glob from "glob"
import path from "path"
import { CONFIG_FILE, ROOT_PACKAGE_FILE } from "./constants.js"
import { reporter } from "./reporter.js"
import { configDefault } from "./config-default.js"

const cwd = process.cwd()
const CONFIG_PATH = path.resolve(cwd, CONFIG_FILE)
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

function createPackageMeta(dir) {
  const pkgPath = path.resolve(dir, ROOT_PACKAGE_FILE)

  if (!fs.existsSync(pkgPath)) {
    reporter.fail("Package root is missing package.json, unable to proceed")
    process.exit(1)
  }

  const getPackage = () => JSON.parse(fs.readFileSync(pkgPath, "utf8"))
  const content = getPackage()

  return {
    getPackage,
    name: content.name,
    dir,
  }
}

export function normalizeConfig() {
  reporter.start("Preparing for release")

  let config = {
    set releaseVersion(value) {
      config._rVersion = value
    },
    get releaseVersion() {
      return config._rVersion
    },
  }

  if (!fs.existsSync(ROOT_PACKAGE_PATH)) {
    reporter.fail("Current directory is not a repository")
    process.exit(1)
  }

  const rootPackage = JSON.parse(fs.readFileSync(ROOT_PACKAGE_PATH, "utf8"))

  if (fs.existsSync(CONFIG_PATH)) {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"))
  } else if (rootPackage["release-workspaces"]) {
    config = rootPackage["release-workspaces"]
  } else {
    reporter.warn(
      "No release-workspaces config detecting. Proceeding with defaults."
    )
  }

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
  config.packages = packageRoots.map(createPackageMeta)

  // Validate packages are within the current repo root
  for (const pkg of config.packages) {
    validatePackagePaths(pkg.dir)
  }

  reporter.succeed("Ready to release")

  return config
}

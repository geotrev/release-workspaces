#!/usr/bin/env node

import fs from "fs"
import path from "path"
import { exitWithError, pkgReporter } from "./helpers/reporter.js"
import { ROOT_PACKAGE_FILE } from "./helpers/constants.js"
import { cmd } from "./helpers/cmd.js"

function setDependencies(config, entry) {
  const { getPackage, dir } = entry
  const pkgContent = getPackage()
  const dependencies = []
  const types = [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ]

  types.forEach((type) => {
    if (!pkgContent[type]) return
    const packageNames = Object.keys(pkgContent[type])

    if (packageNames.length) {
      dependencies.push({ type, packageNames })
    }
  })

  if (dependencies.length) {
    dependencies.forEach(({ type, packageNames }) => {
      packageNames
        .filter((name) =>
          config.packageNames.some((pkgName) => pkgName === name)
        )
        .forEach((name) => {
          pkgContent[type][name] = `^${config.releaseVersion}`
        })
    })

    const newPkgJson = JSON.stringify(pkgContent, null, 2)
    const writeCommand = `fs.writeFileSync(path.resolve(dir, "${ROOT_PACKAGE_FILE}"), newPkgJson, "utf8")`

    if (config.dryRun) {
      if (config.verbose) {
        pkgReporter.info(writeCommand)
      }
    } else {
      try {
        if (config.verbose) {
          pkgReporter.info(writeCommand)
        }

        fs.writeFileSync(
          path.resolve(dir, ROOT_PACKAGE_FILE),
          newPkgJson,
          "utf8"
        )
      } catch (e) {
        exitWithError(e, "Unable to update package.json.")
      }
    }
  }
}

export async function runIncrement(config, entry) {
  pkgReporter.start("Version")

  const incCommand = `npm version -w ${entry.name} ${config.releaseVersion} --no-git-tag-version`

  await cmd(incCommand, config, pkgReporter)

  setDependencies(config, entry)

  pkgReporter.succeed("Version successful")
}

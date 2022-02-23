#!/usr/bin/env node

import fs from "fs"
import path from "path"
import { exec } from "./helpers/exec-promise.js"
import { pkgReporter, reporter } from "./helpers/reporter.js"
import { ROOT_PACKAGE_FILE } from "./helpers/constants.js"

function incrementDependencies(args, config, entry) {
  pkgReporter.start("Increment co-dependencies")

  const { getPackage, dir } = entry
  const pkgContent = getPackage()
  const dependencies = []
  const rangePrefix = config.increment.rangePrefix
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
          pkgContent[type][name] = `${rangePrefix}${pkgContent.version}`
        })
    })

    const newPkgJson = JSON.stringify(pkgContent, null, 2)
    const writeCommand = `fs.writeFileSync(path.resolve(dir, "${ROOT_PACKAGE_FILE}"), newPkgJson, "utf8")`

    if (args.dryRun) {
      pkgReporter.info(writeCommand)
    } else {
      try {
        fs.writeFileSync(
          path.resolve(dir, ROOT_PACKAGE_FILE),
          newPkgJson + "\n",
          "utf8"
        )
      } catch (e) {
        /* eslint-disable-next-line no-console */
        console.error("Error:", e)
        reporter.fail(`Something went wrong updating package.json`)
        process.exit(1)
      }
    }

    pkgReporter.succeed("Co-dependencies updated")
  } else {
    pkgReporter.succeed("No co-dependencies detected")
  }
}

export async function version(args, config, entry, newVersion) {
  pkgReporter.start(`Bump ${entry.name} to v${newVersion}`)

  const incCommand = `npm version -w ${entry.name} ${newVersion} --no-git-tag-version`

  if (args.dryRun) {
    pkgReporter.info(incCommand)
  } else {
    try {
      await exec(incCommand)
    } catch (e) {
      /* eslint-disable-next-line no-console */
      console.error("Error", e)
      reporter.fail("Something went wrong while versioning")
      process.exit(1)
    }
  }

  if (config.increment.codependencies) {
    incrementDependencies(args, config, entry)
  }

  pkgReporter.succeed("Version successful")
}

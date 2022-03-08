#!/usr/bin/env node

import fs from "fs"
import path from "path"
import { getVersionCommand } from "../helpers/commands.js"
import { exitWithError, report } from "../helpers/reporter.js"
import { cmd } from "../helpers/cmd.js"
import { ROOT_PACKAGE_FILE } from "../helpers/constants.js"

function getSemverRangePart(version) {
  let rangePart = ""
  const parts = version.split("")
  const length = parts.length

  for (let i = 0; i < length; i++) {
    const part = parts[i]
    const partIsNumber = !isNaN(parseInt(part, 10))
    const versionRangeEnd = i !== 0

    if (partIsNumber) {
      if (versionRangeEnd) {
        rangePart = version.slice(0, i)
      }

      break
    }
  }

  return rangePart
}

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
          const rangePart = getSemverRangePart(pkgContent[type][name])
          pkgContent[type][name] = `${rangePart}${config.releaseVersion}`
        })
    })

    const newPkgJson = JSON.stringify(pkgContent, null, 2)
    const writeCommand = `fs.writeFileSync(path.resolve(dir, "${ROOT_PACKAGE_FILE}"), newPkgJson, "utf8")`

    if (config.dryRun) {
      if (config.verbose) {
        report({ m: writeCommand, type: "info", indent: true })
      }
    } else {
      try {
        if (config.verbose) {
          report({ m: writeCommand, type: "info", indent: true })
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
  report({ m: "Version", type: "start", indent: true })

  await cmd(getVersionCommand(entry.name, config.releaseVersion), config, true)

  setDependencies(config, entry)

  report({ m: "Version successful", type: "succeed", indent: true })
}

#!/usr/bin/env node

import fs from "fs"
import path from "path"
import { findUpSync } from "find-up"
import {
  CONFIG_NAME,
  ROOT_CONFIG_FILE,
  ROOT_PACKAGE_FILE,
} from "./helpers/constants.js"
import { cmd } from "./helpers/cmd.js"
import { reporter, logErr } from "./helpers/reporter.js"

export async function setConfig(config) {
  reporter.start("Update root version")

  const cwd = process.cwd()

  let updatePkg = false,
    updateConfig = false
  const configPath = findUpSync([ROOT_CONFIG_FILE])
  const configFile = configPath
    ? JSON.parse(fs.readFileSync(configPath, "utf8"))
    : {}
  const packagePath = fs.readFileSync(path.resolve(cwd, ROOT_PACKAGE_FILE))
  const packageFile = JSON.parse(packagePath)

  if (configFile.metadata.version) {
    configFile.metadata.version = config.releaseVersion
    updateConfig = true
  }

  if (packageFile.version === config.prevVersion) {
    packageFile.version = config.releaseVersion
    updatePkg = true
  }

  if (packageFile[CONFIG_NAME]?.metadata?.version) {
    packageFile[CONFIG_NAME].metadata.version = config.releaseVersion
    updatePkg = true
  }

  if (updateConfig) {
    const configCmd =
      'fs.writeFileSync(configPath, JSON.stringify(configFile, null, 2), "utf8")'

    if (config.dryRun) {
      if (config.verbose) {
        reporter.info(configCmd)
      }
    } else {
      try {
        fs.writeFileSync(
          configPath,
          JSON.stringify(configFile, null, 2),
          "utf8"
        )
      } catch (e) {
        logErr(
          e,
          "Unable to update config. Rerun with `--no-npm.increment --no-npm.publish` to try again."
        )
      }
    }
  }

  if (updatePkg) {
    const packageCmd =
      'fs.writeFileSync(packagePath, JSON.stringify(packageFile, null, 2), "utf8")'

    if (config.dryRun) {
      if (config.verbose) {
        reporter.info(packageCmd)
      }
    } else {
      try {
        fs.writeFileSync(
          packagePath,
          JSON.stringify(packageFile, null, 2),
          "utf8"
        )
      } catch (e) {
        logErr(
          e,
          "Unable to update package.json. Rerun with `--no-npm.increment --no-npm.publish` to try again."
        )
      }
    }
  }

  const addChangesCommand = "git add . -u"
  await cmd(addChangesCommand, config)

  reporter.succeed()
}

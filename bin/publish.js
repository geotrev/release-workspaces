#!/usr/bin/env node

import semver from "semver"
import { exec } from "./helpers/exec-promise.js"
import { pkgReporter, logErr } from "./helpers/reporter.js"

function parsePreId(entry) {
  const version = entry.getPackage().version
  const parts = semver.prerelease(version) || []
  return parts[0]
}

export async function runPublish(config, entry) {
  pkgReporter.start(`Publish ${entry.name}`)

  const isPrivate = entry.getPackage().private
  const pubTag = config.npmTag || config.preid || parsePreId(entry) || "latest"
  const pubCommand = `npm publish -w ${entry.name} --tag ${pubTag}`
  const addChangesCommand = "git add . -u"

  if (config.dryRun) {
    pkgReporter.info(addChangesCommand)

    if (!isPrivate) {
      pkgReporter.info(pubCommand)
    }
  } else {
    try {
      if (config.verbose) {
        pkgReporter.info(addChangesCommand)
      }

      await exec(addChangesCommand)

      if (!isPrivate) {
        if (config.verbose) {
          pkgReporter.info(pubCommand)
        }

        await exec(pubCommand)
      }
    } catch (e) {
      logErr(e, `Something went wrong releasing ${entry.name}`)
    }
  }

  if (isPrivate) {
    pkgReporter.succeed("Private package, skipping publish")
  } else {
    pkgReporter.succeed("Publish successful")
  }
}

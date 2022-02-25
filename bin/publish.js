#!/usr/bin/env node

import semver from "semver"
import { exec } from "./helpers/exec-promise.js"
import { pkgReporter, logErr } from "./helpers/reporter.js"

function parsePreId(version) {
  const parts = semver.prerelease(version) || []
  return parts[0]
}

export async function runPublish(config, entry) {
  pkgReporter.start("Publish")

  const isPrivate = entry.getPackage().private
  const pubTag =
    config.npmTag ||
    config.preid ||
    parsePreId(config.releaseVersion) ||
    "latest"
  const pubCommand = `npm publish -w ${entry.name} --tag ${pubTag}`
  const addChangesCommand = "git add . -u"

  if (!isPrivate) {
    if (config.dryRun) {
      if (config.verbose) {
        pkgReporter.info(addChangesCommand)
        pkgReporter.info(pubCommand)
      }
    } else {
      try {
        if (config.verbose) {
          pkgReporter.info(addChangesCommand)
          pkgReporter.info(pubCommand)
        }

        await exec(addChangesCommand)
        await exec(pubCommand)
      } catch (e) {
        logErr(e, `Something went wrong releasing ${entry.name}`)
      }
    }

    pkgReporter.succeed("Publish successful")
  } else {
    pkgReporter.succeed("Publish skipped (private)")
  }
}

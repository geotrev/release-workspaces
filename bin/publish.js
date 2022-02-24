#!/usr/bin/env node

import { exec } from "./helpers/exec-promise.js"
import { pkgReporter, logErr } from "./helpers/reporter.js"

export async function publish(config, entry) {
  pkgReporter.start(`Publish ${entry.name}`)

  const pubTag = config.npmTag || config.preid || "latest"
  const pubCommand = `npm publish -w ${entry.name} --tag ${pubTag}`
  const addChangesCommand = "git add . -u"

  if (config.dryRun) {
    pkgReporter.info(addChangesCommand)
    pkgReporter.info(pubCommand)
  } else {
    try {
      if (config.verbose) {
        pkgReporter.info(addChangesCommand)
      }

      await exec(addChangesCommand)

      if (config.verbose) {
        pkgReporter.info(pubCommand)
      }

      await exec(pubCommand)
    } catch (e) {
      logErr(e, `Something went wrong releasing ${entry.name}`)
    }
  }

  pkgReporter.succeed("Publish successful")
}

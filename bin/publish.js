#!/usr/bin/env node

import { exec } from "./helpers/exec-promise.js"
import { reporter, pkgReporter } from "./helpers/reporter.js"

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
      await exec(addChangesCommand)
      await exec(pubCommand)
    } catch (e) {
      /* eslint-disable-next-line no-console */
      console.error("Error:", e)
      reporter.fail(`Something went wrong releasing ${entry.name}`)
      process.exit(1)
    }
  }

  pkgReporter.succeed("Publish successful")
}

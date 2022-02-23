#!/usr/bin/env node

import { exec } from "./helpers/exec-promise.js"
import { reporter, pkgReporter } from "./helpers/reporter.js"

export async function publish(args, entry) {
  pkgReporter.start(`Publish ${entry.name}`)

  let failures = false
  const pubTag = args.npmTag || args.preid || "latest"
  const pubCommand = `npm publish -w ${entry.name} --tag ${pubTag}`
  const addChangesCommand = "git add . -u"

  if (args.dryRun) {
    pkgReporter.info(addChangesCommand)
    pkgReporter.info(pubCommand)
  } else {
    try {
      await exec(addChangesCommand)
      await exec(pubCommand)
    } catch (e) {
      failures = true
      /* eslint-disable-next-line no-console */
      console.error("Error:", e)
    }
  }

  if (failures) {
    reporter.fail(`Something went wrong releasing ${entry.name}`)
    return false
  } else {
    pkgReporter.succeed("Publish successful")
    return true
  }
}

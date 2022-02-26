#!/usr/bin/env node

import semver from "semver"
import { cmd } from "./helpers/cmd.js"
import { pkgReporter } from "./helpers/reporter.js"

function parsePreId(version) {
  const parts = semver.prerelease(version) || []
  return parts[0]
}

export async function runPublish(config, entry) {
  pkgReporter.start("Publish")

  const isPrivate = entry.getPackage().private
  const tag =
    config.npmTag ||
    config.preid ||
    parsePreId(config.releaseVersion) ||
    "latest"

  if (!isPrivate) {
    const addChangesCommand = "git add . -u"
    const pubCommand = `npm publish -w ${entry.name} --tag ${tag}`

    await cmd(addChangesCommand, config, pkgReporter)
    await cmd(pubCommand, config, pkgReporter)

    pkgReporter.succeed("Publish successful")
  } else {
    pkgReporter.succeed("Publish skipped (private)")
  }
}

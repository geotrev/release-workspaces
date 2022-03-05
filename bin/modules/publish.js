#!/usr/bin/env node

import semver from "semver"
import { getAddCommand } from "../helpers/git-commands.js"
import { cmd } from "../helpers/cmd.js"
import { pkgReporter } from "../helpers/reporter.js"
import { getPublishCommand } from "../helpers/npm-commands.js"

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
    await cmd(getAddCommand(), config, pkgReporter)
    await cmd(getPublishCommand(entry.name, tag), config, pkgReporter)

    pkgReporter.succeed("Publish successful")
  } else {
    pkgReporter.succeed("Publish skipped (private)")
  }
}

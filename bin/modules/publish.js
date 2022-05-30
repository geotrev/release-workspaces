#!/usr/bin/env node

import semver from "semver"
import { getPublishCommand } from "../helpers/commands.js"
import { cmd } from "../helpers/cmd.js"
import { report } from "../helpers/reporter.js"

function parsePreId(version) {
  const parts = semver.prerelease(version) || []
  return parts[0]
}

export async function runPublish(config) {
  report({ m: `Publishing...`, type: "start" })

  const tag =
    config.npmTag ||
    config.preid ||
    parsePreId(config.releaseVersion) ||
    "latest"

  await cmd(getPublishCommand(tag), config, true)

  report({
    m: { text: "Published", symbol: "🚀" },
    type: "stopAndPersist",
  })
}

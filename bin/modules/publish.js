#!/usr/bin/env node

import semver from "semver"
import { getPublishCommand } from "../helpers/commands.js"
import { cmd } from "../helpers/cmd.js"
import { report } from "../helpers/reporter.js"
import { setRollback } from "../helpers/rollback.js"

function parsePreId(version) {
  const parts = semver.prerelease(version) || []
  return parts[0]
}

export async function runPublish(config, entry) {
  report({ m: "Publish", type: "start", indent: true })

  const isPrivate = entry.getPackage().private
  const tag =
    config.npmTag ||
    config.preid ||
    parsePreId(config.releaseVersion) ||
    "latest"

  if (isPrivate) {
    report({ m: "Publish skipped (private)", type: "succeed", indent: true })
  } else {
    await cmd(getPublishCommand(entry.name, tag), config, true)

    setRollback(config, {
      type: "publish",
      callback: async () => {
        await report({
          m: `${entry.name}@${config.releaseVersion}: This package is already published. Delete this tag on npm OR use a new version in your next release.`,
        })
      },
    })

    report({ m: "Publish successful", type: "succeed", indent: true })
  }
}

#!/usr/bin/env node

import { getArgs } from "./helpers/get-args.js"
import { normalizeConfig } from "./helpers/normalize-config.js"

import { increment } from "./increment.js"
import { commit } from "./commit.js"

export async function release(userArgs, userConfig) {
  const args = userArgs
    ? Object.assign({ verbose: false, dryRun: false }, userArgs)
    : getArgs()
  const config = normalizeConfig(args, userConfig)
  const { npm, git } = config

  // Increment version and publish to npm

  if (npm.increment || npm.publish) {
    await increment(args, config)
  }

  // Commit changes, create tag, and push to origin

  if (git.commit || git.tag) {
    await commit(args, config)
  }
}

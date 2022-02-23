#!/usr/bin/env node

import { getArgs } from "./helpers/get-args.js"
import { normalizeConfig } from "./helpers/normalize-config.js"
import { triggerCmd } from "./helpers/trigger-cmd.js"

import { increment } from "./increment.js"
import { commit } from "./commit.js"

export async function release(userArgs, userConfig) {
  const args = userArgs
    ? Object.assign({ verbose: false, dryRun: false }, userArgs)
    : getArgs()
  const config = normalizeConfig(args, userConfig)
  const { preincrement, postincrement, precommit, postcommit } = config.hooks
  const { npm, git } = config

  // Increment version and publish to npm

  if (npm.increment || npm.publish) {
    if (preincrement) {
      await triggerCmd({
        args,
        cmd: preincrement,
        step: "preincrement",
      })
    }

    await increment(args, config)

    if (postincrement) {
      await triggerCmd({
        args,
        cmd: postincrement,
        step: "postincrement",
      })
    }
  }

  // Commit changes and push to origin

  if (git.commit || git.tag) {
    if (precommit) {
      await triggerCmd({ args, cmd: precommit, step: "Precommit" })
    }

    await commit(args, config)

    if (postcommit) {
      await triggerCmd({ args, cmd: postcommit, step: "Postcommit" })
    }
  }
}

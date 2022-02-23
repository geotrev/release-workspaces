#!/usr/bin/env node

import { getArgs } from "./helpers/get-args.js"
import { normalizeConfig } from "./helpers/normalize-config.js"
import { triggerCmd } from "./helpers/trigger-cmd.js"

import { increment } from "./increment.js"
import { commit } from "./commit.js"

async function releaseWorkspaces(userArgs, userConfig) {
  const args = userArgs || getArgs()
  const config = userConfig || normalizeConfig()
  const { prepublish, postpublish, precommit, postcommit } = config.hooks
  const { npm, git } = config

  // Increment version and publish to npm

  if (npm.increment) {
    if (prepublish) {
      await triggerCmd({
        args,
        cmd: prepublish,
        step: "Prepublish",
      })
    }

    await increment(args, config)

    if (postpublish) {
      await triggerCmd({
        args,
        cmd: postpublish,
        step: "Postpublish",
      })
    }
  }

  // Commit changes and push to origin

  if (git.commit) {
    if (precommit) {
      await triggerCmd({ args, cmd: precommit, step: "Precommit" })
    }

    await commit(args, config)

    if (postcommit) {
      await triggerCmd({ args, cmd: postcommit, step: "Postcommit" })
    }
  }
}

releaseWorkspaces()

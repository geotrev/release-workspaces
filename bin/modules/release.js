#!/usr/bin/env node

import { getArgs } from "../helpers/get-args.js"
import { enableRollback, disableRollback } from "../helpers/rollback.js"
import { runNpm } from "./npm.js"
import { runGit } from "./git.js"
import { initialize } from "./initialize.js"

export async function release() {
  const config = getArgs()
  await initialize(config)

  const {
    npm: { increment, publish },
    git: { commit, tag },
  } = config

  // Allow rollback if user cancels the script

  enableRollback()

  // Increment version and publish to npm

  if (increment || publish) {
    await runNpm(config)
  }

  // Commit changes, create tag, and push to origin

  if (commit || tag) {
    await runGit(config)
  }

  disableRollback()
}

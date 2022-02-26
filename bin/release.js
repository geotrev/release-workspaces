#!/usr/bin/env node

import { getArgs } from "./helpers/get-args.js"
import { normalizeConfig } from "./helpers/normalize-config.js"
import { reportCmd } from "./helpers/cmd.js"
import { setConfig } from "./helpers/set-config.js"
import { hasUnstaged } from "./helpers/has-unstaged.js"

import { runNpm } from "./npm.js"
import { runCommit } from "./commit.js"
import { exitWithError } from "./helpers/reporter.js"

export async function release() {
  const config = getArgs()
  normalizeConfig(config)
  const {
    npm: { increment, publish },
    hooks: { prenpm, postnpm },
    git: { requireCleanDir, commit, tag },
  } = config

  const unstaged = await hasUnstaged()
  if (requireCleanDir && unstaged) {
    exitWithError(
      "Unstaged changes!",
      "You must have a clean working directory to release. Use --no-git.requireCleanDir to ignore this error."
    )
  }

  // Increment version and publish to npm

  if (increment || publish) {
    if (prenpm) {
      await reportCmd(prenpm, { ...config, step: "Prenpm" })
    }

    await runNpm(config)

    if (postnpm) {
      await reportCmd(postnpm, { ...config, step: "Postnpm" })
    }
  }

  await setConfig(config)

  // Commit changes, create tag, and push to origin

  if (commit || tag) {
    await runCommit(config)
  }
}

release()

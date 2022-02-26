#!/usr/bin/env node

import { getArgs } from "./helpers/get-args.js"
import { normalizeConfig } from "./helpers/normalize-config.js"
import { reportCmd } from "./helpers/cmd.js"
import { setRootVersion } from "./helpers/set-root-version.js"
import { hasUnstaged } from "./helpers/has-unstaged.js"

import { runNpm } from "./npm.js"
import { runCommit } from "./commit.js"
import { exitWithError } from "./helpers/reporter.js"

export async function release() {
  const config = getArgs()
  normalizeConfig(config)
  const {
    dryRun,
    npm: { increment, publish },
    hooks: { prenpm, postnpm },
    git: { requireCleanDir, commit, tag },
  } = config

  const unstaged = await hasUnstaged()
  if (requireCleanDir && !dryRun && unstaged) {
    exitWithError(
      "Unstaged changes!",
      "You must have a clean working directory to release. Use --no-git.requireCleanDir to ignore this error."
    )
  }

  // Increment version and publish to npm

  if (increment || publish) {
    if (prenpm) await reportCmd(prenpm, { ...config, step: "Prenpm" })

    await runNpm(config)

    if (postnpm) await reportCmd(postnpm, { ...config, step: "Postnpm" })

    if (increment) await setRootVersion(config)
  }

  // Commit changes, create tag, and push to origin

  if (commit || tag) await runCommit(config)
}

release()

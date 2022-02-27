#!/usr/bin/env node

import { exec } from "./exec-promise.js"
import { exitWithError } from "./reporter.js"
import { GitErrors } from "./constants.js"

export async function checkUnstaged(config) {
  const {
    dryRun,
    git: { requireCleanDir },
  } = config
  if (!requireCleanDir || dryRun) return

  const unstaged = (await exec("git status -s")).stdout

  if (unstaged) {
    exitWithError(
      GitErrors.UNSTAGED,
      "You're trying to release from a dirty working directory. Sync to remote or try again with '--no-git.requireCleanDir'."
    )
  }
}

/**
 * Compare ref status of current branch [ @ ] and its upstream [ @{u} ]
 * See: https://stackoverflow.com/a/3278427
 * @returns {[String, (String|Null)]} - Tuple of the result.
 */
export async function checkRefStatus(config) {
  const {
    dryRun,
    git: { requireSync },
  } = config
  if (!requireSync || dryRun) return

  await exec("git fetch && git remote update")

  const UPSTREAM_REF = "@{u}"
  const base = (await exec(`git rev-parse @{0} ${UPSTREAM_REF}`)).stdout
  const local = (await exec("git rev-parse @{0}")).stdout
  const remote = (await exec(`git rev-parse ${UPSTREAM_REF}`)).stdout

  if (local === remote) {
    // branch is OK
  } else if (local === base) {
    exitWithError(
      GitErrors.NEEDS_PULL,
      "Your branch is behind the remote. Pull from remote or try again with '--no-git.requireSync' to ignore this error"
    )
  } else if (remote === base) {
    exitWithError(
      GitErrors.NEEDS_PUSH,
      "Your branch is ahead of the remote. Push to remote or try again with '--no-git.requireSync' to ignore this error"
    )
  } else {
    exitWithError(
      GitErrors.DIVERGED,
      "You're trying to release on a diverged branch. Sync to remote or try again with '--no-git.requireSync' to ignore this error'."
    )
  }

  process.exit(0)
}

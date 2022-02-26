#!/usr/bin/env node

import { getArgs } from "./helpers/get-args.js"
import { reportCmd } from "./helpers/cmd.js"
import { setRootVersion } from "./helpers/set-root-version.js"

import { runNpm } from "./npm.js"
import { runCommit } from "./commit.js"
import { initialize } from "./initialize.js"

export async function release() {
  const config = getArgs()

  await initialize(config)

  const {
    npm: { increment, publish },
    hooks: { prenpm, postnpm },
    git: { commit, tag },
  } = config

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

#!/usr/bin/env node

import { getArgs } from "./helpers/get-args.js"
import { normalizeConfig } from "./helpers/normalize-config.js"

import { runNpm } from "./npm.js"
import { runCommit } from "./commit.js"
import { setConfig } from "./set-config.js"
import { reportCmd } from "./helpers/cmd.js"

export async function release() {
  const config = getArgs()
  normalizeConfig(config)
  const {
    npm: { increment, publish },
    hooks: { prenpm, postnpm },
    git: { commit, tag },
  } = config

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

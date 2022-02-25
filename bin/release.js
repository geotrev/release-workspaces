#!/usr/bin/env node

import { getArgs } from "./helpers/get-args.js"
import { normalizeConfig } from "./helpers/normalize-config.js"

import { runNpm } from "./npm.js"
import { runCommit } from "./commit.js"
import { cmd } from "./helpers/cmd.js"

export async function release() {
  const config = getArgs()
  normalizeConfig(config)
  const { npm, git, hooks } = config

  // Increment version and publish to npm

  if (npm.increment || npm.publish) {
    if (hooks.prenpm) {
      await cmd({ config, cmd: hooks.prenpm, step: "Prenpm" })
    }

    await runNpm(config)

    if (hooks.postnpm) {
      await cmd({ config, cmd: hooks.postnpm, step: "Postnpm" })
    }
  }

  // Commit changes, create tag, and push to origin

  if (git.commit || git.tag) {
    await runCommit(config)
  }
}

release()

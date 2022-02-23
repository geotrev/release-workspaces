#!/usr/bin/env node

import { triggerCmd } from "./helpers/trigger-cmd.js"

export async function commit(args, config) {
  const {
    commitMessage,
    tagMessage,
    tag: shouldTag,
    commit: shouldCommit,
  } = config.git
  const VERSION_INSERT = "${version}"

  if (shouldCommit) {
    const commitMsg =
      commitMessage.indexOf(VERSION_INSERT) > -1
        ? commitMessage.replace(VERSION_INSERT, config.releaseVersion)
        : commitMessage
    const commitCmd = `git commit -m '${commitMsg}'`
    await triggerCmd({
      args,
      cmd: commitCmd,
      step: "Commit",
    })
  }

  if (shouldTag) {
    const tagMsg =
      tagMessage.indexOf(VERSION_INSERT) > -1
        ? tagMessage.replace(VERSION_INSERT, config.releaseVersion)
        : tagMessage
    const tagCmd = `git tag -a -m '${tagMsg}' ${config.releaseVersion}`

    await triggerCmd({
      args,
      cmd: tagCmd,
      step: "Tag",
    })
  }

  if (shouldTag || shouldCommit) {
    const pushCmd = "git push --follow-tags"
    await triggerCmd({
      args,
      cmd: pushCmd,
      step: "Push",
    })
  }
}
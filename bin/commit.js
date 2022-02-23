#!/usr/bin/env node

import { triggerCmd } from "./helpers/trigger-cmd.js"

export async function commit(args, config) {
  const { commitMessage, tagMessage } = config.git
  const VERSION_INSERT = "${version}"
  const commitMsg =
    commitMessage.indexOf(VERSION_INSERT) > -1
      ? commitMessage.replace(VERSION_INSERT, config.releaseVersion)
      : commitMessage
  const tagMsg =
    tagMessage.indexOf(VERSION_INSERT) > -1
      ? tagMessage.replace(VERSION_INSERT, config.releaseVersion)
      : tagMessage
  const commitCmd = `git commit -m '${commitMsg}'`
  const tagCmd = `git tag -a -m '${tagMsg}' ${config.releaseVersion}`
  const pushCmd = "git push --follow-tags"

  await triggerCmd({
    args,
    cmd: commitCmd,
    step: "Commit",
  })

  await triggerCmd({
    args,
    cmd: tagCmd,
    step: "Tag",
  })

  await triggerCmd({
    args,
    cmd: pushCmd,
    step: "Push",
  })
}

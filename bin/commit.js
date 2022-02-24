#!/usr/bin/env node

import { triggerCmd } from "./helpers/trigger-cmd.js"

export async function commit(args, config) {
  const {
    commitMessage,
    tagMessage,
    tag: shouldTag,
    commit: shouldCommit,
    push: shouldPush,
  } = config.git
  const { precommit, postcommit, pretag, posttag, prepush, postpush } =
    config.hooks
  const VERSION_INSERT = "${version}"

  if (shouldCommit) {
    const commitMsg =
      commitMessage.indexOf(VERSION_INSERT) > -1
        ? commitMessage.replace(VERSION_INSERT, config.releaseVersion)
        : commitMessage
    const commitCmd = `git commit -m '${commitMsg}'`

    if (precommit) {
      await triggerCmd({ args, cmd: precommit, step: "Precommit" })
    }

    await triggerCmd({
      args,
      cmd: commitCmd,
      step: "Commit",
    })

    if (postcommit) {
      await triggerCmd({ args, cmd: postcommit, step: "Postcommit" })
    }
  }

  // Create the tag

  if (shouldTag) {
    const tagMsg =
      tagMessage.indexOf(VERSION_INSERT) > -1
        ? tagMessage.replace(VERSION_INSERT, config.releaseVersion)
        : tagMessage
    const tagCmd = `git tag -a -m '${tagMsg}' ${config.releaseVersion}`

    if (pretag) {
      await triggerCmd({ args, cmd: pretag, step: "Pretag" })
    }

    await triggerCmd({
      args,
      cmd: tagCmd,
      step: "Tag",
    })

    if (posttag) {
      await triggerCmd({ args, cmd: posttag, step: "Posttag" })
    }
  }

  // If committing or tagging, push it up

  if (shouldPush && (shouldTag || shouldCommit)) {
    const pushCmd = "git push --follow-tags"

    if (prepush) {
      await triggerCmd({ args, cmd: prepush, step: "Prepush" })
    }

    await triggerCmd({
      args,
      cmd: pushCmd,
      step: "Push",
    })

    if (postpush) {
      await triggerCmd({ args, cmd: postpush, step: "Postpush" })
    }
  }
}

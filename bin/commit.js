#!/usr/bin/env node

import { reportCmd } from "./helpers/cmd.js"

export async function runCommit(config) {
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
      await reportCmd({ config, cmd: precommit, step: "Precommit" })
    }

    await reportCmd({ config, cmd: commitCmd, step: "Commit" })

    if (postcommit) {
      await reportCmd({ config, cmd: postcommit, step: "Postcommit" })
    }
  }

  // Create the tag

  if (shouldTag) {
    const tagMsg =
      tagMessage.indexOf(VERSION_INSERT) > -1
        ? tagMessage.replace(VERSION_INSERT, config.releaseVersion)
        : tagMessage
    const tagCmd = `git tag -a -m '${tagMsg}' v${config.releaseVersion}`

    if (pretag) {
      await reportCmd({ config, cmd: pretag, step: "Pretag" })
    }

    await reportCmd({ config, cmd: tagCmd, step: "Tag" })

    if (posttag) {
      await reportCmd({ config, cmd: posttag, step: "Posttag" })
    }
  }

  // If committing or tagging, push it up

  if (shouldPush && (shouldTag || shouldCommit)) {
    const pushCmd = "git push --follow-tags"

    if (prepush) {
      await reportCmd({ config, cmd: prepush, step: "Prepush" })
    }

    await reportCmd({ config, cmd: pushCmd, step: "Push" })

    if (postpush) {
      await reportCmd({ config, cmd: postpush, step: "Postpush" })
    }
  }
}

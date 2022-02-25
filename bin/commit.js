#!/usr/bin/env node

import { cmd } from "./helpers/cmd.js"

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
      await cmd({ config, cmd: precommit, step: "Precommit" })
    }

    await cmd({ config, cmd: commitCmd, step: "Commit" })

    if (postcommit) {
      await cmd({ config, cmd: postcommit, step: "Postcommit" })
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
      await cmd({ config, cmd: pretag, step: "Pretag" })
    }

    await cmd({ config, cmd: tagCmd, step: "Tag" })

    if (posttag) {
      await cmd({ config, cmd: posttag, step: "Posttag" })
    }
  }

  // If committing or tagging, push it up

  if (shouldPush && (shouldTag || shouldCommit)) {
    const pushCmd = "git push --follow-tags"

    if (prepush) {
      await cmd({ config, cmd: prepush, step: "Prepush" })
    }

    await cmd({ config, cmd: pushCmd, step: "Push" })

    if (postpush) {
      await cmd({ config, cmd: postpush, step: "Postpush" })
    }
  }
}

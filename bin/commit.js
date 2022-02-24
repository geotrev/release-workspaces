#!/usr/bin/env node

import { triggerCmd } from "./helpers/trigger-cmd.js"

function getCurrentVersion(config) {
  return config.packages[0].getPackage().version
}

export async function commit(config) {
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
  const tagVersion = config.releaseVersion || getCurrentVersion(config)

  if (shouldCommit) {
    const commitMsg =
      commitMessage.indexOf(VERSION_INSERT) > -1
        ? commitMessage.replace(VERSION_INSERT, tagVersion)
        : commitMessage
    const commitCmd = `git commit -m '${commitMsg}'`

    if (precommit) {
      await triggerCmd({ config, cmd: precommit, step: "Precommit" })
    }

    await triggerCmd({ config, cmd: commitCmd, step: "Commit" })

    if (postcommit) {
      await triggerCmd({ config, cmd: postcommit, step: "Postcommit" })
    }
  }

  // Create the tag

  if (shouldTag) {
    const tagMsg =
      tagMessage.indexOf(VERSION_INSERT) > -1
        ? tagMessage.replace(VERSION_INSERT, tagVersion)
        : tagMessage
    const tagCmd = `git tag -a -m '${tagMsg}' ${tagVersion}`

    if (pretag) {
      await triggerCmd({ config, cmd: pretag, step: "Pretag" })
    }

    await triggerCmd({ config, cmd: tagCmd, step: "Tag" })

    if (posttag) {
      await triggerCmd({ config, cmd: posttag, step: "Posttag" })
    }
  }

  // If committing or tagging, push it up

  if (shouldPush && (shouldTag || shouldCommit)) {
    const pushCmd = "git push --follow-tags"

    if (prepush) {
      await triggerCmd({ config, cmd: prepush, step: "Prepush" })
    }

    await triggerCmd({ config, cmd: pushCmd, step: "Push" })

    if (postpush) {
      await triggerCmd({ config, cmd: postpush, step: "Postpush" })
    }
  }
}

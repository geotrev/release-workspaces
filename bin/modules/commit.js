#!/usr/bin/env node

import { ReportSteps } from "../helpers/constants.js"
import { getCommitCmd, getTagCmd, getPushCmd } from "../helpers/git-commands.js"
import { setVersionToString } from "../helpers/transformers.js"
import { reportCmd } from "../helpers/cmd.js"

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

  if (shouldCommit) {
    const commitMsg = setVersionToString(commitMessage, config.releaseVersion)

    if (precommit) {
      await reportCmd(precommit, { ...config, step: ReportSteps.PRECOMMIT })
    }

    await reportCmd(getCommitCmd(commitMsg), {
      ...config,
      step: ReportSteps.COMMIT,
    })

    if (postcommit) {
      await reportCmd(postcommit, { ...config, step: ReportSteps.POSTCOMMIT })
    }
  }

  // Create the tag

  if (shouldTag) {
    const tagMsg = setVersionToString(tagMessage, config.releaseVersion)

    if (pretag) {
      await reportCmd(pretag, { ...config, step: ReportSteps.PRETAG })
    }

    await reportCmd(getTagCmd(tagMsg, config.releaseVersion), {
      ...config,
      step: ReportSteps.TAG,
    })

    if (posttag) {
      await reportCmd(posttag, { ...config, step: ReportSteps.POSTTAG })
    }
  }

  // If committing or tagging, push it up

  if (shouldPush && (shouldTag || shouldCommit)) {
    if (prepush) {
      await reportCmd(prepush, { ...config, step: ReportSteps.PREPUSH })
    }

    await reportCmd(getPushCmd(), { ...config, step: ReportSteps.PUSH })

    if (postpush) {
      await reportCmd(postpush, { ...config, step: ReportSteps.POSTPUSH })
    }
  }
}

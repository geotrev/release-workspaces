#!/usr/bin/env node

import { report } from "../helpers/reporter.js"
import { ReportSteps } from "../helpers/constants.js"
import { getAddCommand } from "../helpers/commands.js"
import { cmd, reportCmd } from "../helpers/cmd.js"
import { runIncrement } from "./increment.js"
import { runPublish } from "./publish.js"
import { setRollback } from "../helpers/rollback.js"
import { setRootVersion } from "../helpers/set-root-version.js"

export async function runNpm(config) {
  const {
    packages,
    hooks: { preincrement, postincrement, prepublish, postpublish },
    npm: { increment, publish },
  } = config
  const length = packages.length

  if (preincrement) {
    await reportCmd(preincrement, { ...config, step: ReportSteps.PREINCREMENT })
  }

  setRollback(config, {
    type: "increment",
    callback: async () => {
      await cmd("git reset --hard HEAD", config)
    },
  })

  for (let i = 0; i < length; i++) {
    const entry = packages[i]
    const { name } = entry

    report({
      m: {
        text: `${name}@${config.releaseVersion}`,
        symbol: "📦",
      },
      type: "stopAndPersist",
    })

    if (increment) {
      await runIncrement(config, entry)
    }
  }

  if (increment) {
    // Stage increment changes
    await cmd(getAddCommand(), config)
  }

  if (postincrement) {
    await reportCmd(postincrement, {
      ...config,
      step: ReportSteps.POSTINCREMENT,
    })
  }

  if (prepublish) {
    await reportCmd(prepublish, { ...config, step: ReportSteps.PREPUBLISH })
  }

  for (let i = 0; i < length; i++) {
    const entry = packages[i]
    const { name } = entry

    report({
      m: {
        text: `${name}@${config.releaseVersion}`,
        symbol: "📦",
      },
      type: "stopAndPersist",
    })

    if (publish) {
      await runPublish(config, entry)
    }
  }

  if (postpublish) {
    await reportCmd(postpublish, { ...config, step: ReportSteps.POSTPUBLISH })
  }

  if (increment) {
    await setRootVersion(config)
  }

  report({
    m: "All packages versioned/published without errors",
    type: "succeed",
  })
}

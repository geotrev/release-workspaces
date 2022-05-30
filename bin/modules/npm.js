#!/usr/bin/env node

import { report } from "../helpers/reporter.js"
import { ReportSteps } from "../helpers/constants.js"
import { getAddCommand } from "../helpers/commands.js"
import { cmd, reportCmd } from "../helpers/cmd.js"
import { runIncrement } from "./increment.js"
import { runPublish } from "./publish.js"
import { queueRollback } from "../helpers/rollback.js"
import { setRootVersion } from "../helpers/set-root-version.js"

export async function runNpm(config) {
  const {
    hooks: { preincrement, postincrement, prepublish, postpublish },
    npm: { increment, publish },
  } = config

  queueRollback(config, {
    type: "increment",
    callback: async () => {
      await cmd("git reset --hard HEAD", config)
    },
  })

  if (increment) {
    if (preincrement) {
      await reportCmd(preincrement, {
        ...config,
        step: ReportSteps.PREINCREMENT,
      })
    }

    await runIncrement(config)

    // Set root version to config/package.json, then stage changes
    await setRootVersion(config)
    await cmd(getAddCommand(), config)

    if (postincrement) {
      await reportCmd(postincrement, {
        ...config,
        step: ReportSteps.POSTINCREMENT,
      })
    }
  }

  if (publish) {
    if (prepublish) {
      await reportCmd(prepublish, { ...config, step: ReportSteps.PREPUBLISH })
    }

    queueRollback(config, {
      type: "publish",
      callback: async () => {
        for (const pkg of config.packages) {
          await cmd(
            `npm deprecate ${pkg.name}@${config.releaseVersion}`,
            config
          )
        }
      },
    })

    await runPublish(config)

    if (postpublish) {
      await reportCmd(postpublish, { ...config, step: ReportSteps.POSTPUBLISH })
    }
  }

  if (increment || publish) {
    const action =
      increment && publish
        ? "versioned/published"
        : increment
        ? "versioned"
        : "published"
    const suffix =
      increment && publish
        ? ""
        : !increment
        ? " (version skipped)"
        : " (publish skipped)"

    report({
      m: `All packages ${action} successfully${suffix}`,
      type: "succeed",
    })
  } else {
    report({
      m: "Version/publish skipped for all packages",
      type: "succeed",
    })
  }
}

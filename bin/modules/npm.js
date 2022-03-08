#!/usr/bin/env node

import { report } from "../helpers/reporter.js"
import { runIncrement } from "./increment.js"
import { runPublish } from "./publish.js"

export async function runNpm(config) {
  const packages = config.packages
  const length = packages.length

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

    if (config.npm.increment) {
      await runIncrement(config, entry)
    }

    if (config.npm.publish) {
      await runPublish(config, entry)
    }
  }

  report({
    m: "All packages versioned/published without errors",
    type: "succeed",
  })
}

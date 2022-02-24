#!/usr/bin/env node

import semver from "semver"
import { reporter } from "./helpers/reporter.js"
import { triggerCmd } from "./helpers/trigger-cmd.js"
import { version } from "./version.js"
import { publish } from "./publish.js"

export async function increment(config) {
  const packages = config.packages
  const { prepublish, postpublish, preincrement, postincrement } = config
  const length = packages.length

  for (let i = 0; i < length; i++) {
    const entry = packages[i]
    const { getPackage, name } = entry
    const pkgContent = getPackage()

    // Get new version

    const newVersion = semver.inc(
      pkgContent.version,
      config.target,
      config.preid
    )

    if (!newVersion) {
      reporter.fail("Invalid target version requested")
      process.exit(1)
    }

    if (!config.releaseVersion) {
      config.releaseVersion = newVersion
    }

    reporter.stopAndPersist({
      text: `${name}@${newVersion}`,
      symbol: "📦",
    })

    if (config.npm.increment) {
      if (preincrement) {
        await triggerCmd({ config, cmd: preincrement, step: "Preincrement" })
      }

      await version(config, entry, newVersion)

      if (postincrement) {
        await triggerCmd({ config, cmd: postincrement, step: "Postincrement" })
      }
    }

    if (config.npm.publish) {
      if (prepublish) {
        await triggerCmd({ config, cmd: prepublish, step: "Prepublish" })
      }

      await publish(config, entry)

      if (postpublish) {
        await triggerCmd({ config, cmd: postpublish, step: "Postpublish" })
      }
    }
  }

  reporter.succeed("All packages versioned/published without errors")
}

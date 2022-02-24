#!/usr/bin/env node

import semver from "semver"
import { reporter } from "./helpers/reporter.js"
import { triggerCmd } from "./helpers/trigger-cmd.js"
import { version } from "./version.js"
import { publish } from "./publish.js"

export async function increment(args, config) {
  const packages = config.packages
  const { prepublish, postpublish, preincrement, postincrement } = config
  const length = packages.length

  for (let i = 0; i < length; i++) {
    const entry = packages[i]
    const { getPackage, name } = entry
    const pkgContent = getPackage()

    // Get new version

    const newVersion = semver.inc(pkgContent.version, args.target, args.preid)

    if (!newVersion) {
      reporter.fail("Invalid target version requested")
      process.exit(1)
    }

    config.releaseVersion = newVersion

    reporter.stopAndPersist({
      text: `${name}@${newVersion}`,
      symbol: "📦",
    })

    if (config.npm.increment) {
      if (preincrement) {
        await triggerCmd({
          args,
          cmd: preincrement,
          step: "preincrement",
        })
      }

      await version(args, config, entry, newVersion)

      if (postincrement) {
        await triggerCmd({
          args,
          cmd: postincrement,
          step: "postincrement",
        })
      }
    }

    if (config.npm.publish) {
      if (prepublish) {
        await triggerCmd({
          args,
          cmd: prepublish,
          step: "prepublish",
        })
      }

      await publish(args, entry)

      if (postpublish) {
        await triggerCmd({
          args,
          cmd: postpublish,
          step: "postpublish",
        })
      }
    }
  }

  reporter.succeed("All packages versioned/published without errors")
}

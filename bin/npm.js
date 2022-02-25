#!/usr/bin/env node

import semver from "semver"
import { reporter } from "./helpers/reporter.js"
import { runIncrement } from "./increment.js"
import { runPublish } from "./publish.js"

export async function runNpm(config) {
  const packages = config.packages
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
      await runIncrement(config, entry, newVersion)
    }

    if (config.npm.publish) {
      await runPublish(config, entry)
    }
  }

  reporter.succeed("All packages versioned/published without errors")
}

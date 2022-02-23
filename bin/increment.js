#!/usr/bin/env node

import semver from "semver"
import { reporter } from "./helpers/reporter.js"
import { version } from "./version.js"
import { publish } from "./publish.js"

export async function increment(args, config) {
  const packages = config.packages
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
      await version(args, config, entry, newVersion)
    }

    if (config.npm.publish) {
      await publish(args, entry)
    }
  }

  reporter.succeed("All packages versioned/published without errors")
}

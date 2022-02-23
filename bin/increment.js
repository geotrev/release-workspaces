#!/usr/bin/env node

import semver from "semver"
import { reporter } from "./helpers/reporter.js"
import { version } from "./version.js"
import { publish } from "./publish.js"

export async function increment(args, config) {
  let failures = false
  const packages = config.packages
  const length = packages.length

  for (let i = 0; i < length; i++) {
    const entry = packages[i]
    const { getPackage, name } = entry
    const pkgContent = getPackage()

    // Get new version

    const newVersion = args.preid
      ? semver.inc(pkgContent.version, args.target || "prerelease", args.preid)
      : semver.inc(pkgContent.version, args.target, args.preid)

    if (!newVersion) {
      reporter.fail("Invalid target version requested")
      process.exit(1)
    }

    config.releaseVersion = newVersion

    reporter.stopAndPersist({
      text: `${name}@${newVersion}`,
      symbol: "📦",
    })

    const versioned = await version(args, config, entry, newVersion)
    let published

    if (versioned) {
      published = await publish(args, entry)

      if (!published) {
        failures = true
      }
    } else {
      failures = true
    }
  }

  if (failures) {
    reporter.warn(
      "Some packages weren't published. You might need to fix something and re-release."
    )
  } else {
    reporter.succeed("All packages published without errors")
  }
}

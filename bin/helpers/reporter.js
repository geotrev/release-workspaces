#!/usr/bin/env node

import ora from "ora"

export const reporter = ora()
export const pkgReporter = ora({ indent: 4 })

export function exitWithError(error, message) {
  reporter.fail(`Error: ${message}`)
  process.exit(1)
}

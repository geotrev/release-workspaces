#!/usr/bin/env node

import ora from "ora"

export const reporter = ora()
export const pkgReporter = ora({ indent: 4 })
export const logErr = (error, message) => {
  /* eslint-disable-next-line no-console */
  console.error("Error:", error)
  reporter.fail(message)
  process.exit(1)
}

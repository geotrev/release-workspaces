#!/usr/bin/env node

import ora from "ora"

const reporter = ora()
const indentReporter = ora({ indent: 4 })

export function report({ m, type = "info", indent = false }) {
  return indent ? indentReporter[type](m) : reporter[type](m)
}

function newConsoleLine() {
  /* eslint-disable-next-line no-console */
  console.log("")
}

export function exitWithError(error, m) {
  newConsoleLine()
  /* eslint-disable-next-line no-console */
  console.error("Error:", error)
  reporter({ m, type: "fail" })
  process.exit(1)
}

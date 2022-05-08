#!/usr/bin/env node

import ora from "ora"

const reporter = ora()

export function report({ m, type = "info" }) {
  return reporter[type](m)
}

function newConsoleLine() {
  /* eslint-disable-next-line no-console */
  console.log("")
}

export function exitWithError(m) {
  newConsoleLine()
  report({ m, type: "fail" })
  process.exit(1)
}

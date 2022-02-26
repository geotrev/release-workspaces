#!/usr/bin/env node

import { exec } from "./exec-promise.js"

export async function hasUnstaged() {
  return (await exec("git status -s")).stdout
}

#!/usr/bin/env node

import yargs from "yargs"
import { findUpSync } from "find-up"
import fs from "fs"

export function getArgs(userArgs) {
  const configPath = findUpSync([".release-workspaces.json"])
  const config = configPath
    ? JSON.parse(fs.readFileSync(configPath))
    : userArgs || {}

  return yargs(process.argv.slice(2))
    .option("verbose", {
      default: false,
      type: "boolean",
      describe: "Prints all commands used by the tool during execution.",
    })
    .option("dry-run", {
      alias: "d",
      default: false,
      type: "boolean",
      describe: "Prints commands, but doesn't execute them.",
    })
    .option("target", {
      alias: "t",
      type: "string",
      describe: "The semver target.",
    })
    .option("preid", {
      alias: "p",
      type: "string",
      describe: "The prerelease id. Overriden by '-n' when publishing.",
    })
    .option("npm-tag", {
      alias: "n",
      type: "string",
      describe: "The npm tag. Falls back to preid or 'latest'.",
    })
    .config(config)
    .pkgConf("release-workspaces")
    .parse()
}

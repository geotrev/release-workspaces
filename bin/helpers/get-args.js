#!/usr/bin/env node

import yargs from "yargs"
import { findUpSync } from "find-up"
import fs from "fs"
import {
  RELEASE_INCREMENTS,
  CONFIG_NAME,
  ROOT_CONFIG_FILE,
} from "./constants.js"

export function getArgs(userArgs) {
  const configPath = findUpSync([ROOT_CONFIG_FILE])
  const config = configPath
    ? JSON.parse(fs.readFileSync(configPath, "utf8"))
    : userArgs || {}

  return yargs(process.argv.slice(2))
    .option("verbose", {
      alias: "b",
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
    .option("increment-to", {
      alias: "s",
      type: "string",
      describe: "The specific version to publish.",
    })
    .option("increment", {
      alias: "i",
      type: "string",
      describe: "The release level to increment by.",
      choices: RELEASE_INCREMENTS,
    })
    .option("preid", {
      alias: "p",
      type: "string",
      describe: "The prerelease id. Overriden by '-n' when publishing.",
    })
    .option("npm-tag", {
      alias: "n",
      type: "string",
      describe: "The npm publish tag. Falls back to preid or 'latest'.",
    })
    .config(config)
    .pkgConf(CONFIG_NAME)
    .parse()
}

#!/usr/bin/env node

import yargs from "yargs"

export function getArgs() {
  return yargs(process.argv.slice(2))
    .option("config", {
      alias: "c",
      type: "string",
      describe: "User config target.",
    })
    .option("verbose", {
      default: false,
      type: "boolean",
      describe: "Prints all commands used by the tool.",
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
    .option("prerelease", {
      alias: "r",
      default: false,
      type: "boolean",
      describe: "If given, increments existing prerelease version",
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
    }).argv
}
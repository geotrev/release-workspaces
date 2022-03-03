#!/usr/bin/env node

export const CONFIG_NAME = "release-workspaces"
export const ROOT_PACKAGE_FILE = "package.json"
export const ROOT_CONFIG_FILE = `.${CONFIG_NAME}.json`
export const VERSION_INSERT = "${version}"

export const GitErrors = {
  NEEDS_PULL: "Behind remote",
  NEEDS_PUSH: "Ahead of remote",
  DIVERGED: "Diverged",
  UNSTAGED: "Unstaged changes",
}

export const RELEASE_INCREMENTS = [
  "major",
  "minor",
  "patch",
  "premajor",
  "preminor",
  "prepatch",
  "prerelease",
]

export const ReportSteps = {
  PRECOMMIT: "Precommit",
  COMMIT: "Commit",
  POSTCOMMIT: "Postcommit",
  PRETAG: "Pretag",
  TAG: "Tag",
  POSTTAG: "Posttag",
  PREPUSH: "Prepush",
  PUSH: "Push",
  POSTPUSH: "Postpush",
}

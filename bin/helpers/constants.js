#!/usr/bin/env node

export const CONFIG_NAME = "release-workspaces"
export const ROOT_PACKAGE_FILE = "package.json"
export const ROOT_CONFIG_FILE = `.${CONFIG_NAME}.json`
export const VERSION_INSERT = "${version}"

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
  PREINCREMENT: "Preincrement",
  POSTINCREMENT: "Postincrement",
  PREPUBLISH: "Prepublish",
  POSTPUBLISH: "Postpublish",
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

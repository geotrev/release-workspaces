#!/usr/bin/env node

export const ROOT_PACKAGE_FILE = "package.json"
export const CONFIG_NAME = "release-workspaces"
export const ROOT_CONFIG_FILE = `.${CONFIG_NAME}.json`

export const GitErrors = {
  NEEDS_PULL: "Behind remote",
  NEEDS_PUSH: "Ahead of remote",
  DIVERGED: "Diverged",
  UNSTAGED: "Unstaged changes",
}

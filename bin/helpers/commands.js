export function getCommitCmd(msg) {
  return `git commit -m '${msg}'`
}

export function getTagCmd(msg, version) {
  return `git tag -a -m '${msg}' v${version}`
}

export function getPushCmd() {
  return "git push --follow-tags"
}

export function getAddCommand() {
  return "git add . -u"
}

export function getPublishCommand(tag) {
  return `npm publish -ws --tag ${tag}`
}

export function getVersionCommand(version) {
  return `npm version -ws ${version} --no-git-tag-version`
}

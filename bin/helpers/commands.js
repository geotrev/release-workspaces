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

export function getPublishCommand(name, tag) {
  return `npm publish -w ${name} --tag ${tag}`
}

export function getVersionCommand(name, version) {
  return `npm version -w ${name} ${version} --no-git-tag-version`
}

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

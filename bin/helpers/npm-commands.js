export function getPublishCommand(name, tag) {
  return `npm publish -w ${name} --tag ${tag}`
}

export function getVersionCommand(name, version) {
  return `npm version -w ${name} ${version} --no-git-tag-version`
}

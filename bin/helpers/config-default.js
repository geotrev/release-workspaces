export const configDefault = {
  metadata: {
    version: "",
  },
  hooks: {
    prenpm: "",
    postnpm: "",
    precommit: "",
    postcommit: "",
    pretag: "",
    posttag: "",
    prepush: "",
    postpush: "",
  },
  npm: {
    increment: true,
    publish: true,
  },
  git: {
    commitMessage: "Release ${version}",
    tagMessage: "Release ${version}",
    requireCleanDir: true,
    requireSync: true,
    skipChecks: false,
    commit: true,
    tag: true,
    push: true,
  },
}

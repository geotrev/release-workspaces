export const configDefault = {
  metadata: {
    version: "",
  },
  hooks: {
    preincrement: "",
    postincrement: "",
    prepublish: "",
    postpublish: "",
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

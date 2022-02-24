export const configDefault = {
  increment: {
    codependencies: true,
    rangePrefix: "^",
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
    commit: true,
    tag: true,
    push: true,
  },
}

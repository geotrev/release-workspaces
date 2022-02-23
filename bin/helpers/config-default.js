export const configDefault = {
  increment: {
    codependencies: true,
    rangePrefix: "^",
  },
  hooks: {
    prepublish: "",
    postpublish: "",
    precommit: "",
    postcommit: "",
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
  },
}

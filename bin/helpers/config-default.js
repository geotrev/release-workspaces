export const configDefault = {
  increment: {
    codependencies: false,
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
  },
  git: {
    commitMessage: "Release ${version}",
    tagMessage: "Release ${version}",
    commit: true,
  },
}

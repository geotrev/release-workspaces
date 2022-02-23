export const configDefault = {
  increment: {
    codependencies: true,
    rangePrefix: "^",
  },
  hooks: {
    preincrement: "",
    postincrement: "",
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
    tag: true,
  },
}

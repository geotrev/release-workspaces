export const configDefault = {
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
    commit: true,
    tag: true,
    push: true,
  },
}

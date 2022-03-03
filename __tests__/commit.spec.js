import "./mocks.js"
import { ReportSteps } from "../bin/helpers/constants.js"
import {
  getCommitCmd,
  getTagCmd,
  getPushCmd,
} from "../bin/helpers/git-commands.js"
import { setVersionToString } from "../bin/helpers/transformers.js"
import { runCommit } from "../bin/commit.js"
import { reportCmd } from "../bin/helpers/cmd.js"

jest.mock("../bin/helpers/cmd.js", () => ({
  reportCmd: jest.fn(),
}))

const baseConfig = {
  releaseVersion: "0.0.0",
  hooks: {
    precommit: "npm test",
    postcommit: "npm test",
    pretag: "npm test",
    posttag: "npm test",
    prepush: "npm test",
    postpush: "npm test",
  },
  git: {
    commitMessage: "test ${version}",
    tagMessage: "test ${version}",
    tag: false,
    commit: false,
    push: false,
  },
}

describe("runCommit()", () => {
  describe("tag, commit, and push are false", () => {
    it("does not run commands", async () => {
      await runCommit(baseConfig)
      expect(reportCmd).not.toBeCalled()
    })
  })

  describe("commit is true", () => {
    let config

    beforeEach(async () => {
      // Given
      config = {
        ...baseConfig,
        git: { ...baseConfig.git, commit: true },
      }
      // When
      await runCommit(config)
    })

    it("runs precommit hook", async () => {
      expect(reportCmd).toBeCalledWith(
        config.hooks.precommit,
        expect.objectContaining({
          ...config,
          step: ReportSteps.PRECOMMIT,
        })
      )
    })

    it("runs commit command", async () => {
      expect(reportCmd).toBeCalledWith(
        setVersionToString(
          getCommitCmd(config.git.commitMessage),
          config.releaseVersion
        ),
        expect.objectContaining({
          ...config,
          step: ReportSteps.COMMIT,
        })
      )
    })

    it("runs postcommit hook", async () => {
      expect(reportCmd).toBeCalledWith(
        config.hooks.postcommit,
        expect.objectContaining({
          ...config,
          step: ReportSteps.POSTCOMMIT,
        })
      )
    })
  })

  describe("tag is true", () => {
    let config

    beforeEach(async () => {
      // Given
      config = {
        ...baseConfig,
        git: { ...baseConfig.git, tag: true },
      }
      // When
      await runCommit(config)
    })

    it("runs pretag hook", async () => {
      expect(reportCmd).toBeCalledWith(
        config.hooks.pretag,
        expect.objectContaining({
          ...config,
          step: ReportSteps.PRETAG,
        })
      )
    })

    it("runs tag command", async () => {
      expect(reportCmd).toBeCalledWith(
        setVersionToString(
          getTagCmd(config.git.tagMessage, config.releaseVersion),
          config.releaseVersion
        ),
        expect.objectContaining({
          ...config,
          step: ReportSteps.TAG,
        })
      )
    })

    it("runs posttag hook", async () => {
      expect(reportCmd).toBeCalledWith(
        config.hooks.posttag,
        expect.objectContaining({
          ...config,
          step: ReportSteps.POSTTAG,
        })
      )
    })
  })

  describe("push is true", () => {
    let config

    beforeEach(async () => {
      // Given
      config = {
        ...baseConfig,
        git: { ...baseConfig.git, tag: true, push: true },
      }
      // When
      await runCommit(config)
    })

    it("runs prepush hook", async () => {
      expect(reportCmd).toBeCalledWith(
        config.hooks.prepush,
        expect.objectContaining({
          ...config,
          step: ReportSteps.PREPUSH,
        })
      )
    })

    it("runs push command", async () => {
      expect(reportCmd).toBeCalledWith(
        setVersionToString(getPushCmd(), config.releaseVersion),
        expect.objectContaining({
          ...config,
          step: ReportSteps.PUSH,
        })
      )
    })

    it("runs postpush hook", async () => {
      expect(reportCmd).toBeCalledWith(
        config.hooks.postpush,
        expect.objectContaining({
          ...config,
          step: ReportSteps.POSTPUSH,
        })
      )
    })
  })
})

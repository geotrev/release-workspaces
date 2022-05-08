import "../../.jest/mocks.js"
import { ReportSteps } from "../helpers/constants.js"
import { getCommitCmd, getTagCmd, getPushCmd } from "../helpers/commands.js"
import { setVersionToString } from "../helpers/transformers.js"
import { setRollback } from "../helpers/rollback.js"
import { reportCmd } from "../helpers/cmd.js"
import { runCommit } from "../modules/commit.js"

jest.mock("../helpers/cmd.js", () => ({
  reportCmd: jest.fn(),
  cmd: jest.fn(),
}))

jest.mock("../helpers/rollback.js", () => ({
  setRollback: jest.fn(),
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

    it("calls setRollback", async () => {
      expect(setRollback).toBeCalledWith(
        expect.objectContaining(config),
        expect.objectContaining({
          type: "commit",
          callback: expect.any(Function),
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

    it("calls setRollback", async () => {
      expect(setRollback).toBeCalledWith(
        expect.objectContaining(config),
        expect.objectContaining({
          type: "tag",
          callback: expect.any(Function),
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

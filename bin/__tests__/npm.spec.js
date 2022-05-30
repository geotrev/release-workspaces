import "../../.jest/mocks.js"
import path from "path"
import { ReportSteps } from "../helpers/constants.js"
import { getAddCommand } from "../helpers/commands.js"
import { report } from "../helpers/reporter.js"
import { reportCmd, cmd } from "../helpers/cmd.js"
import { setRollback } from "../helpers/rollback.js"
import { setRootVersion } from "../helpers/set-root-version.js"
import { runNpm } from "../modules/npm.js"
import { runIncrement } from "../modules/increment.js"
import { runPublish } from "../modules/publish.js"

jest.mock("../helpers/reporter.js", () => ({
  report: jest.fn(),
}))
jest.mock("../helpers/cmd.js", () => ({
  reportCmd: jest.fn(),
  cmd: jest.fn(),
}))
jest.mock("../helpers/set-root-version.js", () => ({
  setRootVersion: jest.fn(),
}))
jest.mock("../helpers/rollback.js", () => ({
  setRollback: jest.fn(),
}))
jest.mock("../modules/increment.js", () => ({
  runIncrement: jest.fn(),
}))
jest.mock("../modules/publish.js", () => ({
  runPublish: jest.fn(),
}))

const npmConfig = {
  increment: true,
  publish: true,
}

const config = {
  releaseVersion: "0.0.1",
  npm: npmConfig,
  hooks: {
    preincrement: true,
    postincrement: true,
    prepublish: true,
    postpublish: true,
  },
  packages: [
    {
      name: "@test/one",
      dir: path.resolve(process.cwd(), "packages/one"),
    },
    {
      name: "@test/two",
      dir: path.resolve(process.cwd(), "packages/two"),
    },
  ],
}

describe("runNpm()", () => {
  it("increments packages", async () => {
    // When
    await runNpm(config)
    // Then
    expect(runIncrement).toBeCalled()
  })

  it("publishes packages", async () => {
    // When
    await runNpm(config)
    // Then
    expect(runPublish).toBeCalled()
  })

  it("sets root version", async () => {
    // When
    await runNpm(config)
    // Then
    expect(setRootVersion).toBeCalled()
  })

  it("adds changes to git", async () => {
    // When
    await runNpm(config)
    // Then
    expect(cmd).toBeCalledWith(getAddCommand(), config)
  })

  describe("report", () => {
    it("reports version/publish success", async () => {
      // When
      await runNpm(config)
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({
          m: "All packages versioned/published successfully",
          type: "succeed",
        })
      )
    })

    it("reports version success", async () => {
      // When
      await runNpm({ ...config, npm: { publish: false, increment: true } })
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({
          m: "All packages versioned successfully (publish skipped)",
          type: "succeed",
        })
      )
    })

    it("reports publish success", async () => {
      // When
      await runNpm({ ...config, npm: { publish: true, increment: false } })
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({
          m: "All packages published successfully (version skipped)",
          type: "succeed",
        })
      )
    })

    it("reports version/publish skipped", async () => {
      // When
      await runNpm({ ...config, npm: { publish: false, increment: false } })
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({
          m: "Version/publish skipped for all packages",
          type: "succeed",
        })
      )
    })
  })

  describe("rollbacks", () => {
    it("adds changes action", async () => {
      // When
      await runNpm(config)
      // Then
      expect(setRollback).toBeCalledWith(
        expect.objectContaining(config),
        expect.objectContaining({
          type: "increment",
          callback: expect.any(Function),
        })
      )
    })
  })

  describe("hooks", () => {
    it("runs preincrement hook", async () => {
      // When
      await runNpm(config)
      // Then
      expect(reportCmd).toBeCalledWith(
        config.hooks.preincrement,
        expect.objectContaining({
          ...config,
          step: ReportSteps.PREINCREMENT,
        })
      )
    })

    it("runs postincrement hook", async () => {
      // When
      await runNpm(config)
      // Then
      expect(reportCmd).toBeCalledWith(
        config.hooks.postincrement,
        expect.objectContaining({
          ...config,
          step: ReportSteps.POSTINCREMENT,
        })
      )
    })

    it("runs prepublish hook", async () => {
      // When
      await runNpm(config)
      // Then
      expect(reportCmd).toBeCalledWith(
        config.hooks.prepublish,
        expect.objectContaining({
          ...config,
          step: ReportSteps.PREPUBLISH,
        })
      )
    })

    it("runs postpublish hook", async () => {
      // When
      await runNpm(config)
      // Then
      expect(reportCmd).toBeCalledWith(
        config.hooks.postpublish,
        expect.objectContaining({
          ...config,
          step: ReportSteps.POSTPUBLISH,
        })
      )
    })
  })
})

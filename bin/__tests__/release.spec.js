import "../../.jest/mocks.js"
import { getArgs } from "../helpers/get-args.js"
import { reportCmd } from "../helpers/cmd.js"
import { setRootVersion } from "../helpers/set-root-version.js"
import { runNpm } from "../modules/npm.js"
import { runCommit } from "../modules/commit.js"
import { release } from "../modules/release.js"

jest.mock("../helpers/get-args.js")
jest.mock("../helpers/cmd.js", () => ({
  reportCmd: jest.fn(),
}))
jest.mock("../helpers/set-root-version.js", () => ({
  setRootVersion: jest.fn(),
}))
jest.mock("../modules/commit.js", () => ({
  runCommit: jest.fn(),
}))
jest.mock("../modules/initialize.js")
jest.mock("../modules/npm.js", () => ({
  runNpm: jest.fn(),
}))

const baseConfig = {
  npm: {
    increment: true,
    publish: true,
  },
  hooks: {
    prenpm: "npm test",
    postnpm: "npm test",
  },
  git: {
    commit: true,
    tag: true,
  },
}

describe("release()", () => {
  afterEach(() => {
    getArgs.mockRestore()
  })

  describe("all options", () => {
    beforeEach(() => {
      getArgs.mockImplementation(() => baseConfig)
    })

    it("runs prenpm hook", async () => {
      // When
      await release()
      // Then
      expect(reportCmd).toBeCalledWith(
        baseConfig.hooks.prenpm,
        expect.objectContaining({
          ...baseConfig,
          step: "Prenpm",
        })
      )
    })

    it("runs npm step", async () => {
      // When
      await release()
      // Then
      expect(runNpm).toBeCalled()
    })

    it("runs postnpm hook", async () => {
      // When
      await release()
      // Then
      expect(reportCmd).toBeCalledWith(
        baseConfig.hooks.postnpm,
        expect.objectContaining({
          ...baseConfig,
          step: "Postnpm",
        })
      )
    })

    it("sets root version", async () => {
      // When
      await release()
      // Then
      expect(setRootVersion).toBeCalled()
    })

    it("runs commit step", async () => {
      // When
      await release()
      // Then
      expect(runCommit).toBeCalled()
    })
  })
})

import "./mocks.js"
import { getArgs } from "../bin/helpers/get-args.js"
import { reportCmd } from "../bin/helpers/cmd.js"
import { setRootVersion } from "../bin/helpers/set-root-version.js"
import { runNpm } from "../bin/modules/npm.js"
import { runCommit } from "../bin/modules/commit.js"
import { release } from "../bin/modules/release.js"

jest.mock("../bin/helpers/get-args.js")
jest.mock("../bin/helpers/cmd.js", () => ({
  reportCmd: jest.fn(),
}))
jest.mock("../bin/helpers/set-root-version.js", () => ({
  setRootVersion: jest.fn(),
}))
jest.mock("../bin/modules/commit.js", () => ({
  runCommit: jest.fn(),
}))
jest.mock("../bin/modules/initialize.js")
jest.mock("../bin/modules/npm.js", () => ({
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

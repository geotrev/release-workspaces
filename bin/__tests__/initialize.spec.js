import "../../.jest/mocks.js"
import { normalizeConfig } from "../helpers/normalize-config.js"
import { report } from "../helpers/reporter.js"
import { checkUnstaged, checkRefStatus } from "../helpers/git-helpers.js"
import { initialize } from "../modules/initialize"

jest.mock("../helpers/reporter.js", () => ({
  report: jest.fn(),
}))
jest.mock("../helpers/normalize-config.js", () => ({
  normalizeConfig: jest.fn(),
}))
jest.mock("../helpers/git-helpers.js", () => ({
  checkRefStatus: jest.fn(),
  checkUnstaged: jest.fn(),
}))

const config = {
  git: {
    skipChecks: false,
  },
}

describe("initialize()", () => {
  it("normalizes config", async () => {
    // When
    await initialize(config)
    // Then
    expect(normalizeConfig).toBeCalledWith(expect.objectContaining(config))
  })

  it("checks unstaged", async () => {
    // When
    await initialize(config)
    // Then
    expect(checkUnstaged).toBeCalledWith(expect.objectContaining(config))
  })

  it("checks ref status", async () => {
    // When
    await initialize(config)
    // Then
    expect(checkRefStatus).toBeCalledWith(expect.objectContaining(config))
  })

  it("does not check unstaged or ref status if skipping checks", async () => {
    // When
    await initialize({ git: { skipChecks: true } })
    // Then
    expect(checkUnstaged).not.toBeCalled()
    expect(checkRefStatus).not.toBeCalled()
  })

  describe("reports", () => {
    it("reports start", async () => {
      // When
      await initialize({ git: { skipChecks: true } })
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({
          m: "Preparing to release",
          type: "start",
        })
      )
    })

    it("reports success", async () => {
      // When
      await initialize({ git: { skipChecks: true } })
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({
          m: "Ready to release!",
          type: "succeed",
        })
      )
    })
  })
})

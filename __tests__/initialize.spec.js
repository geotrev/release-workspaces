import "./mocks.js"
import { initialize } from "../bin/initialize"
import { normalizeConfig } from "../bin/helpers/normalize-config.js"
import { checkUnstaged, checkRefStatus } from "../bin/helpers/git-helpers.js"

jest.mock("../bin/helpers/normalize-config.js", () => ({
  normalizeConfig: jest.fn(),
}))
jest.mock("../bin/helpers/git-helpers.js", () => ({
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
})

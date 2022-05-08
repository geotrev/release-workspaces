import "../../.jest/mocks.js"
import { getArgs } from "../helpers/get-args.js"
import { enableRollback, disableRollback } from "../helpers/rollback.js"
import { runNpm } from "../modules/npm.js"
import { runCommit } from "../modules/commit.js"
import { release } from "../modules/release.js"

jest.mock("../helpers/get-args.js")
jest.mock("../helpers/rollback.js", () => ({
  disableRollback: jest.fn(),
  enableRollback: jest.fn(),
}))
jest.mock("../modules/commit.js", () => ({
  runCommit: jest.fn(),
}))
jest.mock("../modules/initialize.js")
jest.mock("../modules/npm.js", () => ({
  runNpm: jest.fn(),
}))

const config = {
  npm: {
    increment: true,
    publish: true,
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

  beforeEach(() => {
    getArgs.mockImplementation(() => config)
  })

  it("enables rollback", async () => {
    // When
    await release()
    // Then
    expect(enableRollback).toBeCalled()
  })

  it("disables rollback", async () => {
    // When
    await release()
    // Then
    expect(disableRollback).toBeCalled()
  })

  it("runs npm step", async () => {
    // When
    await release()
    // Then
    expect(runNpm).toBeCalled()
  })

  it("runs commit step", async () => {
    // When
    await release()
    // Then
    expect(runCommit).toBeCalled()
  })
})

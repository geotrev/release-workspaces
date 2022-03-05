jest.mock("ora", () => () => ({
  start: jest.fn(),
  stopAndPersist: jest.fn(),
  fail: jest.fn(),
  succeed: jest.fn(),
  info: jest.fn(),
}))
jest.mock("fs")
jest.mock("child_process")
jest.mock("util")
jest.mock("yargs")
jest.mock("find-up", () => ({
  findUpSync: jest.fn(),
}))

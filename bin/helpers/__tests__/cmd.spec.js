import { cmd, reportCmd } from "../cmd.js"
import { exec } from "../exec-promise.js"
import { report, exitWithError } from "../reporter.js"

jest.mock("../exec-promise.js", () => ({
  exec: jest.fn(),
}))
jest.mock("../reporter.js", () => ({
  report: jest.fn(),
  exitWithError: jest.fn(),
}))

const baseConfig = {
  dryRun: false,
  verbose: false,
}

describe("cmd", () => {
  it("calls given command", async () => {
    // Given
    const command = "test"
    // When
    await cmd(command, baseConfig)
    // Then
    expect(exec).toBeCalledWith(command)
  })

  it("exits with error if command fails", async () => {
    // Given
    exec.mockImplementation(() => {
      throw new Error("fail")
    })
    const command = "test"
    // When
    await cmd(command, baseConfig)
    // Then
    expect(exitWithError).toBeCalledWith(
      expect.any(Object),
      `Unable to complete command: ${command}`
    )
  })

  describe("reports", () => {
    it("reports command if dry run and verbose", async () => {
      // Given
      const command = "test"
      // When
      await cmd(command, { dryRun: true, verbose: true })
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({ m: command, indent: false })
      )
    })

    it("reports command if verbose", async () => {
      // Given
      const command = "test"
      // When
      await cmd(command, { verbose: true })
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({ m: command, indent: false })
      )
    })
  })
})

describe("reportCmd", () => {
  describe("reports", () => {
    it("reports start", async () => {
      // Given
      const step = "Test"
      const command = "test"
      // When
      await reportCmd(command, { ...baseConfig, step })
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({
          m: step,
          type: "start",
          indent: false,
        })
      )
    })

    it("reports success", async () => {
      // Given
      const step = "Test"
      const command = "test"
      // When
      await reportCmd(command, { ...baseConfig, step })
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({
          m: `${step} successful`,
          type: "succeed",
          indent: false,
        })
      )
    })
  })
})

import "../../.jest/mocks.js"
import path from "path"
import { getPublishCommand } from "../helpers/commands.js"
import { cmd } from "../helpers/cmd.js"
import { report } from "../helpers/reporter.js"
import { runPublish } from "../modules/publish.js"
import { setRollback } from "../helpers/rollback.js"

jest.mock("../helpers/cmd.js", () => ({
  cmd: jest.fn(),
}))
jest.mock("../helpers/reporter.js", () => ({
  report: jest.fn(),
}))
jest.mock("../helpers/rollback.js", () => ({
  setRollback: jest.fn(),
}))

const entry = {
  name: "@test/one",
  dir: path.resolve(process.cwd(), "packages/one"),
  getPackage() {
    return {
      name: "@test/one",
      version: "0.0.1",
    }
  },
}

const privateEntry = {
  name: "@test/two",
  dir: path.resolve(process.cwd(), "packages/two"),
  getPackage() {
    return {
      name: "@test/two",
      private: true,
      version: "0.0.1",
    }
  },
}

const baseConfig = {
  npmTag: "",
  preid: "",
}

describe("runPublish()", () => {
  it("publishes package", async () => {
    // When
    await runPublish(baseConfig, entry)
    // Then
    expect(cmd).toBeCalledWith(
      getPublishCommand(entry.name, "latest"),
      baseConfig,
      true
    )
  })

  it("does not publish private package", async () => {
    // When
    await runPublish(baseConfig, privateEntry)
    // Then
    expect(cmd).not.toBeCalled()
  })

  it("publishes with npm tag if given", async () => {
    // Given
    const config = {
      ...baseConfig,
      npmTag: "next",
    }
    // When
    await runPublish(config, entry)
    // Then
    expect(cmd).toBeCalledWith(
      getPublishCommand(entry.name, "next"),
      config,
      true
    )
  })

  it("publishes with preid if given", async () => {
    // Given
    const config = {
      ...baseConfig,
      preid: "alpha",
    }
    // When
    await runPublish(config, entry)
    // Then
    expect(cmd).toBeCalledWith(
      getPublishCommand(entry.name, "alpha"),
      config,
      true
    )
  })

  it("publishes with parsed preid if it exists", async () => {
    // Given
    const config = {
      ...baseConfig,
      releaseVersion: "0.0.1-beta.0",
    }
    // When
    await runPublish(config, entry)
    // Then
    expect(cmd).toBeCalledWith(
      getPublishCommand(entry.name, "beta"),
      config,
      true
    )
  })

  it("adds publish action if public", async () => {
    // When
    await runPublish(baseConfig, entry)
    // Then
    // eslint-disable-next-line no-unused-vars
    expect(setRollback).toBeCalledWith(
      expect.objectContaining(baseConfig),
      expect.objectContaining({
        type: "publish",
        callback: expect.any(Function),
      })
    )
  })

  describe("report", () => {
    it("reports start", async () => {
      // When
      await runPublish(baseConfig, entry)
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({
          m: `Publishing ${entry.name}...`,
          type: "start",
        })
      )
    })

    it("reports private publish skipped", async () => {
      // When
      await runPublish(baseConfig, privateEntry)
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({
          m: {
            text: `Publish skipped (private): ${privateEntry.name}`,
            symbol: "☕",
          },
          type: "stopAndPersist",
        })
      )
    })

    it("reports publish success", async () => {
      // When
      await runPublish(baseConfig, entry)
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({
          m: {
            text: `Published ${entry.name}`,
            symbol: "🚀",
          },
          type: "stopAndPersist",
        })
      )
    })
  })
})

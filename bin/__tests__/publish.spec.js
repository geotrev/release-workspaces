import "../../.jest/mocks.js"
import path from "path"
import { getPublishCommand } from "../helpers/commands.js"
import { cmd } from "../helpers/cmd.js"
import { report } from "../helpers/reporter.js"
import { runPublish } from "../modules/publish.js"

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
  packages: [entry, privateEntry],
}

describe("runPublish()", () => {
  it("publishes package", async () => {
    // When
    await runPublish(baseConfig)
    // Then
    expect(cmd).toBeCalledWith(getPublishCommand("latest"), baseConfig, true)
  })

  it("publishes with npm tag if given", async () => {
    // Given
    const config = {
      ...baseConfig,
      npmTag: "next",
    }
    // When
    await runPublish(config)
    // Then
    expect(cmd).toBeCalledWith(getPublishCommand("next"), config, true)
  })

  it("publishes with preid if given", async () => {
    // Given
    const config = { ...baseConfig, preid: "alpha" }
    // When
    await runPublish(config)
    // Then
    expect(cmd).toBeCalledWith(getPublishCommand("alpha"), config, true)
  })

  it("publishes with parsed preid if it exists", async () => {
    // Given
    const config = {
      ...baseConfig,
      releaseVersion: "0.0.1-beta.0",
    }
    // When
    await runPublish(config)
    // Then
    expect(cmd).toBeCalledWith(getPublishCommand("beta"), config, true)
  })

  describe("report", () => {
    it("reports start", async () => {
      // When
      await runPublish(baseConfig)
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({ m: `Publishing...`, type: "start" })
      )
    })

    it("reports publish success", async () => {
      // When
      await runPublish(baseConfig)
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({
          m: { text: `Published`, symbol: "🚀" },
          type: "stopAndPersist",
        })
      )
    })
  })
})

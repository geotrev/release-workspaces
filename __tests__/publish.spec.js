import "./mocks.js"
import path from "path"
import { getAddCommand, getPublishCommand } from "../bin/helpers/commands.js"
import { cmd } from "../bin/helpers/cmd.js"
import { report } from "../bin/helpers/reporter.js"
import { runPublish } from "../bin/modules/publish.js"

jest.mock("../bin/helpers/cmd.js", () => ({
  cmd: jest.fn(),
}))
jest.mock("../bin/helpers/reporter.js", () => ({
  report: jest.fn(),
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
  it("adds changes to stage", async () => {
    // When
    await runPublish(baseConfig, entry)
    // Then
    expect(cmd).toBeCalledWith(getAddCommand(), baseConfig, true)
  })

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

  describe("report", () => {
    it("reports start", async () => {
      // When
      await runPublish(baseConfig, entry)
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({
          m: "Publish",
          type: "start",
          indent: true,
        })
      )
    })

    it("reports private publish skipped", async () => {
      // When
      await runPublish(baseConfig, privateEntry)
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({
          m: "Publish skipped (private)",
          type: "succeed",
          indent: true,
        })
      )
    })

    it("reports publish success", async () => {
      // When
      await runPublish(baseConfig, entry)
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({
          m: "Publish successful",
          type: "succeed",
          indent: true,
        })
      )
    })
  })
})

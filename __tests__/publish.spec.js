import "./mocks.js"
import path from "path"
import { getAddCommand } from "../bin/helpers/git-commands.js"
import { runPublish } from "../bin/publish.js"
import { cmd } from "../bin/helpers/cmd.js"
import { pkgReporter } from "../bin/helpers/reporter.js"

jest.mock("../bin/helpers/cmd.js", () => ({
  cmd: jest.fn(),
}))

jest.mock("../bin/helpers/reporter.js", () => ({
  pkgReporter: {
    start: jest.fn(),
    succeed: jest.fn(),
  },
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
    expect(cmd).toBeCalledWith(getAddCommand(), baseConfig, pkgReporter)
  })

  it("publishes package", async () => {
    // When
    await runPublish(baseConfig, entry)
    // Then
    expect(cmd).toBeCalledWith(
      `npm publish -w ${entry.name} --tag latest`,
      baseConfig,
      pkgReporter
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
      `npm publish -w ${entry.name} --tag next`,
      config,
      pkgReporter
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
      `npm publish -w ${entry.name} --tag alpha`,
      config,
      pkgReporter
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
      `npm publish -w ${entry.name} --tag beta`,
      config,
      pkgReporter
    )
  })
})

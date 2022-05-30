import "../../.jest/mocks.js"
import fs from "fs"
import path from "path"
import { report, exitWithError } from "../helpers/reporter.js"
import { cmd } from "../helpers/cmd.js"
import { getVersionCommand } from "../helpers/commands.js"
import { runIncrement } from "../modules/increment.js"

jest.mock("../helpers/cmd.js", () => ({
  cmd: jest.fn(),
}))
jest.mock("../helpers/reporter.js", () => ({
  exitWithError: jest.fn(),
  report: jest.fn(),
}))

const packageNames = ["@test/one", "@test/two"]

const entryOne = {
  name: packageNames[0],
  dir: path.resolve(process.cwd(), "packages/one"),
  getPackage: () => ({
    name: packageNames[0],
    version: "0.0.0",
    dependencies: {
      "@test/two": "~0.0.0",
    },
  }),
}

const entryTwo = {
  name: packageNames[1],
  dir: path.resolve(process.cwd(), "packages/two"),
  getPackage: () => ({
    name: packageNames[1],
    version: "0.0.0",
  }),
}

const config = {
  dryRun: false,
  verbose: false,
  prevVersion: "0.0.0",
  releaseVersion: "0.0.1",
  packageNames,
  packages: [entryOne, entryTwo],
}

describe("runIncrement()", () => {
  describe("version", () => {
    beforeEach(() => {
      fs.writeFileSync = jest.fn()
    })

    afterEach(() => {
      fs.writeFileSync.mockRestore()
    })

    it("versions an entry", async () => {
      // Given
      const command = getVersionCommand(config.releaseVersion)
      // When
      await runIncrement(config)
      // Then
      expect(cmd).toBeCalledWith(command, expect.objectContaining(config), true)
    })

    it("sets new package content", async () => {
      // Given
      const pkg = entryOne.getPackage()
      const newPkgContent = JSON.stringify(
        { ...pkg, dependencies: { "@test/two": "~0.0.1" } },
        null,
        2
      )
      // When
      await runIncrement(config)
      // Then
      expect(fs.writeFileSync).toBeCalledWith(
        `${entryOne.dir}/package.json`,
        newPkgContent,
        "utf8"
      )
    })

    it("does not write to package.json if dry run", async () => {
      // Given
      const dryConfig = { ...config, dryRun: true }
      // When
      await runIncrement(dryConfig)
      // Then
      expect(fs.writeFileSync).not.toBeCalled()
    })

    it("does not write dependency versions when package has no matches", async () => {
      // When
      await runIncrement(config)
      // Then
      expect(fs.writeFileSync).toBeCalledTimes(1)
    })
  })

  describe("errors", () => {
    beforeEach(() => {
      fs.writeFileSync = jest.fn(() => {
        throw new Error()
      })
    })

    afterEach(() => {
      fs.writeFileSync.mockRestore()
    })

    it("exits if write to file fails", async () => {
      // When
      await runIncrement(config)
      // Then
      expect(exitWithError).toBeCalled()
    })
  })

  describe("reports", () => {
    beforeEach(() => {
      fs.writeFileSync = jest.fn()
    })

    afterEach(() => {
      fs.writeFileSync.mockRestore()
    })

    it("reports write command if dry run and verbose", async () => {
      // Given
      const dryConfig = { ...config, verbose: true, dryRun: true }
      // When
      await runIncrement(dryConfig)
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({
          m: `fs.writeFileSync(path.resolve(dir, "package.json"), newPkgJson, "utf8")`,
          type: "info",
        })
      )
    })

    it("reports write command if verbose", async () => {
      // Given
      const verbConfig = { ...config, verbose: true }
      // When
      await runIncrement(verbConfig)
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({
          m: `fs.writeFileSync(path.resolve(dir, "package.json"), newPkgJson, "utf8")`,
          type: "info",
        })
      )
    })

    it("reports start", async () => {
      // When
      await runIncrement(config)
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({
          m: `Incrementing version: ${config.prevVersion} -> ${config.releaseVersion}`,
          type: "start",
        })
      )
    })

    it("reports success", async () => {
      // When
      await runIncrement(config)
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({
          m: {
            text: `Incrementing version: ${config.prevVersion} -> ${config.releaseVersion}`,
            symbol: "📦",
          },
          type: "stopAndPersist",
        })
      )
    })
  })
})

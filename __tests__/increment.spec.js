import "./mocks.js"
import fs from "fs"
import path from "path"
import { pkgReporter, exitWithError } from "../bin/helpers/reporter.js"
import { cmd } from "../bin/helpers/cmd.js"
import { getVersionCommand } from "../bin/helpers/npm-commands.js"
import { runIncrement } from "../bin/modules/increment.js"

jest.mock("../bin/helpers/cmd.js", () => ({
  cmd: jest.fn(),
}))
jest.mock("../bin/helpers/reporter.js", () => ({
  exitWithError: jest.fn(),
  pkgReporter: {
    info: jest.fn(),
    start: jest.fn(),
    succeed: jest.fn(),
  },
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
      const command = getVersionCommand(entryOne.name, config.releaseVersion)
      // When
      await runIncrement(config, entryOne)
      // Then
      expect(cmd).toBeCalledWith(
        command,
        expect.objectContaining(config),
        pkgReporter
      )
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
      await runIncrement(config, entryOne)
      // Then
      expect(fs.writeFileSync).toBeCalledWith(
        `${entryOne.dir}/package.json`,
        newPkgContent,
        "utf8"
      )
    })

    it("prints write command if dry run and verbose", async () => {
      // Given
      const dryConfig = { ...config, verbose: true, dryRun: true }
      // When
      await runIncrement(dryConfig, entryOne)
      // Then
      expect(pkgReporter.info).toBeCalledWith(
        `fs.writeFileSync(path.resolve(dir, "package.json"), newPkgJson, "utf8")`
      )
    })

    it("prints write command if verbose", async () => {
      // Given
      const verbConfig = { ...config, verbose: true }
      // When
      await runIncrement(verbConfig, entryOne)
      // Then
      expect(pkgReporter.info).toBeCalledWith(
        `fs.writeFileSync(path.resolve(dir, "package.json"), newPkgJson, "utf8")`
      )
    })

    it("does not write to package.json if dry run", async () => {
      // Given
      const dryConfig = { ...config, dryRun: true }
      // When
      await runIncrement(dryConfig, entryOne)
      // Then
      expect(fs.writeFileSync).not.toBeCalled()
    })

    it("does not write to file if there are no matching dependencies", async () => {
      // When
      await runIncrement(config, entryTwo)
      // Then
      expect(fs.writeFileSync).not.toBeCalled()
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
      await runIncrement(config, entryOne)
      // Then
      expect(exitWithError).toBeCalled()
    })
  })
})

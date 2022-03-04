import "./mocks.js"
import fs from "fs"
import { runIncrement } from "../bin/increment.js"
import { pkgReporter } from "../bin/helpers/reporter.js"
import { cmd } from "../bin/helpers/cmd.js"
import path from "path"

jest.mock("fs", () => ({
  writeFileSync: jest.fn(),
}))
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
  it("versions an entry", async () => {
    // Given
    const command = `npm version -w ${entryOne.name} ${config.releaseVersion} --no-git-tag-version`
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
})

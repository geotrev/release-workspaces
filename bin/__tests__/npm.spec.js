import "../../.jest/mocks.js"
import path from "path"
import { report } from "../helpers/reporter.js"
import { runNpm } from "../modules/npm.js"
import { runIncrement } from "../modules/increment.js"
import { runPublish } from "../modules/publish.js"

jest.mock("../helpers/reporter.js", () => ({
  report: jest.fn(),
}))
jest.mock("../modules/increment.js", () => ({
  runIncrement: jest.fn(),
}))
jest.mock("../modules/publish.js", () => ({
  runPublish: jest.fn(),
}))

const npmConfig = {
  increment: true,
  publish: true,
}

const config = {
  releaseVersion: "0.0.1",
  npm: npmConfig,
  packages: [
    {
      name: "@test/one",
      dir: path.resolve(process.cwd(), "packages/one"),
    },
    {
      name: "@test/two",
      dir: path.resolve(process.cwd(), "packages/two"),
    },
  ],
}

describe("runNpm()", () => {
  it("increments each package", async () => {
    // When
    await runNpm(config)
    // Then
    expect(runIncrement).toBeCalledTimes(config.packages.length)
  })

  it("publishes each package", async () => {
    // When
    await runNpm(config)
    // Then
    expect(runPublish).toBeCalledTimes(config.packages.length)
  })

  it("does not increment", async () => {
    // When
    await runNpm({
      ...config,
      npm: {
        ...npmConfig,
        increment: false,
      },
    })
    // Then
    expect(runIncrement).not.toBeCalled()
  })

  it("does not publish", async () => {
    // When
    await runNpm({
      ...config,
      npm: {
        ...npmConfig,
        publish: false,
      },
    })
    // Then
    expect(runPublish).not.toBeCalled()
  })

  describe("report", () => {
    it("reports for each package", async () => {
      // When
      await runNpm(config)
      // Then
      for (const pkg of config.packages) {
        expect(report).toBeCalledWith(
          expect.objectContaining({
            m: {
              text: `${pkg.name}@${config.releaseVersion}`,
              symbol: "📦",
            },
            type: "stopAndPersist",
          })
        )
      }
    })

    it("reports success", async () => {
      // When
      await runNpm(config)
      // Then
      expect(report).toBeCalledWith(
        expect.objectContaining({
          m: "All packages versioned/published without errors",
          type: "succeed",
        })
      )
    })
  })
})

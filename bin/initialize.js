import { normalizeConfig } from "./helpers/normalize-config.js"
import { checkUnstaged, checkRefStatus } from "./helpers/git-helpers.js"
import { reporter } from "./helpers/reporter.js"

export async function initialize(config) {
  reporter.start("Preparing to release")

  normalizeConfig(config)

  if (!config.git.skipChecks) {
    await checkUnstaged(config)
    await checkRefStatus(config)
  }

  reporter.succeed("Ready to release!")
}

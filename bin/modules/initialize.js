import { normalizeConfig } from "../helpers/normalize-config.js"
import { checkUnstaged, checkRefStatus } from "../helpers/git-helpers.js"
import { report } from "../helpers/reporter.js"

export async function initialize(config) {
  report({ m: "Preparing to release", type: "start" })

  normalizeConfig(config)

  if (!config.git.skipChecks) {
    await checkUnstaged(config)
    await checkRefStatus(config)
  }

  report({ m: "Ready to release!", type: "succeed" })
}

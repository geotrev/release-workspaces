import { normalizeConfig } from "./helpers/normalize-config.js"
import { hasUnstaged } from "./helpers/has-unstaged.js"
import { reporter, exitWithError } from "./helpers/reporter.js"

export async function initialize(config) {
  reporter.start("Preparing for release...")

  normalizeConfig(config)

  const {
    dryRun,
    git: { requireCleanDir },
  } = config

  const unstaged = await hasUnstaged()
  if (requireCleanDir && !dryRun && unstaged) {
    exitWithError(
      "Unstaged changes!",
      "You must have a clean working directory to release. Use --no-git.requireCleanDir to ignore this error."
    )
  }

  reporter.succeed("Ready to release!")
}

import { exec } from "./exec-promise.js"
import { reporter as defaultReporter, logErr } from "./reporter.js"

export async function cmd(meta, reporter = defaultReporter) {
  reporter.start(meta.step)

  if (meta.config.dryRun) {
    reporter.info(meta.cmd)
  } else {
    try {
      if (meta.config.verbose) {
        reporter.info(meta.cmd)
      }

      await exec(meta.cmd)
    } catch (e) {
      logErr(e, `Unable to complete step: ${meta.step}`)
    }
  }

  reporter.succeed(`${meta.step} successful`)
}

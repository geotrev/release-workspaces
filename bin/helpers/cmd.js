import { exec } from "./exec-promise.js"
import { reporter as defaultReporter, logErr } from "./reporter.js"

export async function cmd(meta, reporter = defaultReporter) {
  if (meta.config.dryRun) {
    if (meta.config.verbose) {
      reporter.info(meta.cmd)
    }
  } else {
    try {
      if (meta.config.verbose) {
        reporter.info(meta.cmd)
      }

      await exec(meta.cmd)
    } catch (e) {
      logErr(e, `Unable to complete command: ${meta.cmd}`)
    }
  }
}

export async function reportCmd(meta, reporter = defaultReporter) {
  reporter.start(meta.step)

  await cmd(meta, reporter)

  reporter.succeed(`${meta.step} successful`)
}

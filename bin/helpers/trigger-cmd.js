import { exec } from "./exec-promise.js"
import { reporter as defaultReporter } from "./reporter.js"

export async function triggerCmd(meta, reporter = defaultReporter) {
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
      /* eslint-disable-next-line no-console */
      console.error(`Erroring running '${meta.cmd}':`, e)
      reporter.fail(`Unable to complete: ${meta.step}`)
    }
  }

  reporter.succeed(`${meta.step} successful`)
}

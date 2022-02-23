import { exec } from "./exec-promise.js"
import { reporter as defaultReporter } from "./reporter.js"

export async function triggerCmd(meta, reporter = defaultReporter) {
  if ((typeof meta.shouldRun !== "undefined" && !meta.shouldRun) || !meta.cmd) {
    return
  }

  reporter.start(meta.step)

  if (meta.args.dryRun) {
    reporter.info(meta.cmd)
  } else {
    try {
      await exec(meta.cmd)
    } catch (e) {
      console.error(`Erroring running '${meta.cmd}':`, e)
      reporter.fail(`Unable to complete: ${meta.step}`)
    }
  }

  reporter.succeed(`${meta.step} successful`)
}

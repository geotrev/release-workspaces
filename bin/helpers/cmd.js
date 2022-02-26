import { exec } from "./exec-promise.js"
import { reporter as defaultReporter, exitWithError } from "./reporter.js"

export async function cmd(command, config, reporter = defaultReporter) {
  if (config.dryRun) {
    if (config.verbose) {
      reporter.info(command)
    }
  } else {
    try {
      if (config.verbose) {
        reporter.info(command)
      }

      await exec(command)
    } catch (e) {
      exitWithError(e, `Unable to complete command: ${command}`)
    }
  }
}

export async function reportCmd(command, config, reporter = defaultReporter) {
  reporter.start(config.step)

  await cmd(command, config, reporter)

  reporter.succeed(`${config.step} successful`)
}

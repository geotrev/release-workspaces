import { exec } from "./exec-promise.js"
import { report, exitWithError } from "./reporter.js"

export async function cmd(command, config, indent = false) {
  const info = { m: command, indent }

  if (config.dryRun) {
    if (config.verbose) {
      report(info)
    }
  } else {
    try {
      if (config.verbose) {
        report(info)
      }

      await exec(command)
    } catch (e) {
      exitWithError(`Unable to complete command: ${command}`)
    }
  }
}

export async function reportCmd(command, config) {
  report({ m: config.step, type: "start" })

  await cmd(command, config)

  report({ m: `${config.step} successful`, type: "succeed" })
}

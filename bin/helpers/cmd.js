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

export async function reportCmd(command, config, indent = false) {
  report({ m: config.step, type: "start", indent })

  await cmd(command, config, indent)

  report({ m: `${config.step} successful`, type: "succeed", indent })
}

import { report } from "./reporter.js"

let isActive = false
const rollbackActions = []

function setIsActive(value) {
  isActive = value
}

async function rollback() {
  const length = rollbackActions.length

  if (length) {
    report({ m: "Rolling back changes...", type: "start" })

    for (let i = length - 1; i >= 0; i--) {
      rollbackActions[i].callback()
    }

    report({ m: "Rollback successful", type: "succeed" })
  }

  disableRollback()
}

export function disableRollback() {
  if (!isActive) return
  setIsActive(false)
  process.off("SIGINT", rollback)
  process.off("exit", rollback)
}

export function queueRollback(config, action) {
  if (config.dryRun) return
  rollbackActions.push(action)
}

export function enableRollback() {
  if (isActive) return
  setIsActive(true)
  process.on("SIGINT", rollback)
  process.on("exit", rollback)
}

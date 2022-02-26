#!/usr/bin/env node

import { exec as e } from "child_process"
import { promisify } from "util"

const promisedExec = promisify(e)

export const exec = async (cmd, opts = {}) =>
  promisedExec(cmd, { stdio: "ignore", cwd: process.cwd(), ...opts })

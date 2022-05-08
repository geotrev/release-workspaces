#!/usr/bin/env node

import { exec as execAsync } from "child_process"
import { promisify } from "util"

const execPromise = promisify(execAsync)

export const exec = async (cmd, options = {}) =>
  execPromise(cmd, { stdio: "ignore", cwd: process.cwd(), ...options })

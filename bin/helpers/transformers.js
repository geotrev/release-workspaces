import { VERSION_INSERT } from "./constants.js"

export function setVersionToString(str, version) {
  return str.indexOf(VERSION_INSERT) > -1
    ? str.replace(VERSION_INSERT, version)
    : str
}

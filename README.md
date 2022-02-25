<h2 align="center">Release Workspaces 🚀</h2>
<p align="center">Automated versioning and publishing of npm workspace projects</p>
<p align="center">
  <a href="https://www.npmjs.com/package/release-workspaces"><img src="https://img.shields.io/npm/v/release-workspaces.svg?sanitize=true&style=flat-square" alt="Version"></a>
  <a href="https://github.com/geotrev/release-workspaces/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/release-workspaces.svg?sanitize=true&style=flat-square" alt="License"></a>
  <a href="https://github.com/geotrev/release-workspaces/actions/workflows/test.yml?query=branch%3Amain"><img src="https://badgen.net/github/checks/geotrev/release-workspaces/main?style=flat-square" alt="CI status" /></a>
</p>

Table of Contents:

- [About](#about)
- [Assumptions](#assumptions)
- [Usage](#usage)
  - [Config File](#config-file)
    - [`metadata`](#metadata)
    - [`npm`](#npm)
    - [`git`](#git)
    - [`hooks`](#hooks)
  - [CLI Options](#cli-options)
    - [Release Flags](#release-flags)
    - [Config Flags](#config-flags)
- [Cheatsheet](#cheatsheet)
- [Roadmap](#roadmap)

## About

`release-workspaces` brings the power of tools like Lerna and Release It! into one package, built with [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces) in mind. Using this utility, you can do the following:

- Version packages
- Publish packages
- Commit, tag, and push to remote

And More\*!

<p><small>*See <a href="#roadmap">roadmap</a></small></p>

## Assumptions

This tool assumes a few things about your workflow:

- You're using npm workspaces (of course) (node 17.x)
- All your packages will use the same version for each release
- You're working in a [module architecture](https://nodejs.org/api/packages.html#introduction)

## Usage

`release-workspaces` is used primarily as a command line integration tool combined with an optional configuration file.

The basic requirement is to have a `version` field defined in your root `package.json` (you can alternatively add [`metadata.version`](#metadata) to your config file). This will be the version of your packages, and is automatically updated for you after a release succeeds, but before the git step.

Using the tool can be as simple as this:

```sh
$ release-workspaces --target major
```

With only a `version` field in your root `package.json`, mind you!

Here's a more complex example of incrementing packages from prerelease, to release candidate, to minor version.

```sh
$ release-workspaces --target preminor --preid alpha # 0.1.0 -> 0.2.0-alpha.0
$ release-workspaces --target prerelease # 0.2.0-alpha.1
$ release-workspaces --target prerelease --preid rc --npm-tag next # 0.2.0-rc.0 @ next
$ release-workspaces --target minor # 0.2.0
```

### Config File

While the tool runs with sensible defaults, you can create a configuration of your own to customize execution.

Define the config in one of two ways:

- `.release-workspaces.json` file in monorepo root
- `"release-workspaces"` field of package.json

#### `metadata`

Basic data about your project.

Defaults:

```json
{
  "metadata": {
    "version": ""
  }
}
```

#### `npm`

Configures how to run npm operations (increment version & publish).

Defaults:

```json
{
  "npm": {
    "increment": true,
    "publish": true
  }
}
```

#### `git`

Configures how to run git operations (commit, tag, push). Use `${version}` in string values to insert the new version when processed.

Defaults:

```json
{
  "git": {
    "commitMessage": "Release ${version}",
    "tagMessage": "Release ${version}",
    "commit": true,
    "tag": true,
    "push": true
  }
}
```

#### `hooks`

Configures the tool to run scripts during the execution lifecycle. If you need to run an npm lifecycle script such as `preversion` or `prepublishOnly`, define them in the individual package's `package.json` to have them trigger automatically at the corresponding step.

Available hooks:

- `prenpm`, `postnpm`: Runs before/after packages are versioned & published
- `precommit`, `postcommit`: Runs before/after publish artifacts are committed
- `pretag`, `posttag`: Runs before/after a release tag is generated
- `prepush`, `postpush`: Runs before/after the commit is pushed to the remote (does not run if both `config.git.commit` and `config.git.tag` are false)

### CLI Options

Arguments passed through the CLI will be passed verbatim to and validated by [semver](https://www.npmjs.com/package/semver) under the hood.

#### Release Flags

| Name              | Type    | Description                                                               |
| ----------------- | ------- | ------------------------------------------------------------------------- |
| `--target`, `-t`  | string  | The target semver increment. E.g. `minor`, `prepatch`, `prerelease`, etc. |
| `--preid`, `-p`   | string  | Sets the prerelease id. E.g. `alpha`, `rc`, etc.                          |
| `--npm-tag`, `-n` | string  | If given, sets the npm tag. Otherwise uses the `preid`. E.g. `next`.      |
| `--dry-run`, `-d` | boolean | Prints output of tool but doesn't execute.                                |
| `--verbose`, `-b` | boolean | Prints all commands (can be used with `--dry-run`)                        |

Note that if `--npm-tag` isn't given, then the tool will fall back to the value given for `--preid`, else it will use `latest`.

Similarly, if you run a git-only release (no version, no publish), the tool will fall back to the current version of your packages.

#### Config Flags

Using config options via CLI will override your config. Useful for one-off releases and otherwise augmenting a base configuration for release types (alpha release, release candidate, no-increment publish, etc).

You can use any of the existing config options as CLI flags by using the formula `--<key>.<property> [value]`. E.g., change the default or user-configured commit message: `--git.commitMessage "chore: release ${version}"`.

Similarly, you can negate any boolean option by prepending `--no-` to it. E.g., `--no-git.commit`.

And yes, you can even specify a version this way with `--metadata.version`.

## Cheatsheet

Here are a few handy examples of how to achieve certain release results:

| Description                     | Example                                                              |
| ------------------------------- | -------------------------------------------------------------------- |
| Do everything                   | `$ release-workspaces --target minor`                                |
| Prerelease                      | `$ release-workspaces --target preminor --preid alpha`               |
| Increment prerelease            | `$ release-workspaces --target prerelease`                           |
| Update prerelease id w/ npm tag | `$ release-workspaces --target prerelease --preid rc --npm-tag next` |
| Prerelease to major/minor/patch | `$ release-workspaces --target minor`                                |
| Skip npm version operation      | `$ release-workspaces --no-npm.increment`                            |
| Skip npm publish operation      | `$ release-workspaces --target minor --no-npm.publish`               |
| Skip git operation              | `$ release-workspaces --target minor --no-git.[commit/tag/push]`     |

## Roadmap

- [ ] Automate GitHub/GitLab releases

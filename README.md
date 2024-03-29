<h2 align="center">Release Workspaces 🚀</h2>
<p align="center">Automated versioning and publishing of npm workspace projects</p>
<p align="center">
  <a href="https://www.npmjs.com/package/release-workspaces"><img src="https://img.shields.io/npm/v/release-workspaces.svg?sanitize=true&style=flat-square" alt="Version"></a>
  <a href="https://github.com/geotrev/release-workspaces/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/release-workspaces.svg?sanitize=true&style=flat-square" alt="License"></a>
  <a href="https://github.com/geotrev/release-workspaces/actions/workflows/test.yml?query=branch%3Amain"><img src="https://badgen.net/github/checks/geotrev/release-workspaces/main?style=flat-square" alt="CI status" /></a>
  <div align="center">
    <img width="500px" height="auto" src="https://github.com/geotrev/release-workspaces/raw/main/demo3.gif" />
  </div>
</p>

**Table of Contents:**

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
- [Clarifications & Gotchas](#clarifications--gotchas)
- [Roadmap](#roadmap)

## About

`release-workspaces` brings the power of Release It! to monorepos. All built with [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces) in mind. Using this utility, you can do the following:

- Version packages
- Publish packages
- Commit, tag, and push to remote
- And More\*!

<p><small>*See <a href="#roadmap">roadmap</a></small></p>

### Scope & Goals

One of the key benefits of npm workspaces is running commands across packages, and managing inter-package dependencies. However, like non-workspace projects, versioning and publishing is more or less a very manual process.

It's therefore _not_ in the perview of this package to interact with behavior beyond versioning and publishing.

## Assumptions

This tool assumes a few things about your workflow:

- You're [logged into NPM](http://npm.github.io/installation-setup-docs/installing/logging-in-and-out.html) from your terminal environment
- You're using npm workspaces (npm 7.x)
- All your packages will use the same version for each release

## Usage

`release-workspaces` is used primarily as a command line integration tool combined with an optional configuration file.

The basic requirement is to have a `version` field defined in your root `package.json` (you can alternatively add [`metadata.version`](#metadata) to your config file). This will be the version of your packages, and is automatically updated for you after a release succeeds.

Using the tool can be as simple as this:

```sh
$ release-workspaces --increment major
# or
$ release-workspaces -i major
```

With only a `version` field in your root `package.json`, mind you!

Here's a more complex example of incrementing packages from prerelease, to release candidate, to minor version.

```sh
$ release-workspaces -i preminor --preid alpha # 0.1.0 -> 0.2.0-alpha.0
$ release-workspaces -i prerelease # 0.2.0-alpha.1
$ release-workspaces -i prerelease --preid rc --npm-tag next # 0.2.0-rc.0 @ next
$ release-workspaces -i minor # 0.2.0
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

_NOTE: Setting both `increment` and `publish` to `false` is a valid configuration if you only wish to tag the latest commit._

#### `git`

Configures how to run git operations (commit, tag, push). Use `${version}` in string values to insert the new version when processed.

Defaults:

```json
{
  "git": {
    "requireCleanDir": true,
    "requireSync": true,
    "skipChecks": false,
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

- `preincrement`, `postincrement`: Runs before/after packages are versioned
- `prepublish`, `postpublish`: Runs before/after packages are published
- `precommit`, `postcommit`: Runs before/after publish artifacts are committed
- `pretag`, `posttag`: Runs before/after a release tag is generated
- `prepush`, `postpush`: Runs before/after the commit is pushed to the remote (does not run if both `config.git.commit` and `config.git.tag` are false)

### CLI Options

Arguments passed through the CLI will be passed verbatim to and validated by [semver](https://www.npmjs.com/package/semver) under the hood.

#### Release Flags

| Name                   | Type    | Description                                                                        |
| ---------------------- | ------- | ---------------------------------------------------------------------------------- |
| `--increment`, `-i`    | string  | The release increment. E.g. `minor`, `prepatch`, `prerelease`, etc.                |
| `--increment-to`, `-s` | string  | A specific version to publish. E.g., `3.0.0`, `3.0.0-rc.2`, etc.                   |
| `--preid`, `-p`        | string  | Sets the prerelease id. E.g. `alpha`, `rc`, etc.                                   |
| `--npm-tag`, `-n`      | string  | If given, sets the npm publish tag. Otherwise uses the `preid`. E.g. `next`.       |
| `--dry-run`, `-d`      | boolean | Prints normal output but doesn't execute.                                          |
| `--verbose`, `-b`      | boolean | Prints all commands and mutating script calls (can be used with `--dry-run`/`-d`). |

Note that if `--npm-tag` isn't given, then the tool will fall back to the value given for `--preid`, else it will use `latest`.

Similarly, if you run a git-only release (no version, no publish), the tool will fall back to the current version of your packages.

#### Config Flags

Using config options via CLI will override your config. Useful for one-off releases and otherwise augmenting a base configuration for release types (alpha release, release candidate, no-increment publish, etc).

You can use any of the existing config options as CLI flags by using the formula `--<key>.<property> [value]`. E.g., change the default or user-configured commit message: `--git.commitMessage "chore: release \${version}"` or disable all git checks with `--git.skipChecks`.

Similarly, you can negate any boolean option by prepending `--no-` to it. E.g., `--no-git.requireCleanDir`.

## Cheatsheet

Here are a few handy examples of how to achieve certain release results with CLI flags. Replace `minor` with your intended release increment.

| Description                     | Example                                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------------------- |
| Do everything                   | `$ release-workspaces -i minor`                                                               |
| Prerelease                      | `$ release-workspaces -i preminor -p alpha`                                                   |
| Increment prerelease            | `$ release-workspaces -i prerelease`                                                          |
| Update prerelease id w/ npm tag | `$ release-workspaces -i prerelease -p rc -n next`                                            |
| Increment to a specific version | `$ release-workspaces -s 3.0.0`                                                               |
| Skip npm version                | `$ release-workspaces --no-npm.increment`                                                     |
| Skip npm publish                | `$ release-workspaces -i minor --no-npm.publish`                                              |
| Skip all npm operations         | `$ release-workspaces --no-npm.increment --no-npm.publish`                                    |
| Skip clean directory check      | `$ release-workspaces -i minor --no-git.requireCleanDir`                                      |
| Skip git sync check             | `$ release-workspaces -i minor --no-git.requireSync`                                          |
| Skip all git checks             | `$ release-workspaces -i minor --git.skipChecks`                                              |
| Skip git operation              | `$ release-workspaces -i minor --no-git.[commit/tag/push]`                                    |
| Set custom messaging            | `$ release-workspaces -i minor --git.[commitMessage/tagMessage] "Custom msg for \${version}"` |

## Clarifications & Gotchas

There are some contradictory or otherwise unclear config combinations to note.

- `config.git.push` is ignored if both `config.git.commit` and `config.git.tag` are `false`.
- `--increment-to`/`-s` is ignored if `config.npm.increment` is `false`.
- `--increment-to`/`-s` will override `--increment`/`-i`.
- `--increment-to`/`-s`, if valid version, will automatically be parsed for an npm tag during the publish step. You can optionally provide `--npm-tag` to override this.

## Roadmap

- [x] Rollback changes if failures occur mid-release
- [ ] Automate GitHub/GitLab releases
- [ ] Release in CI

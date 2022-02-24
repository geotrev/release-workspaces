<h2 align="center">release-workspaces</h2>
<p align="center">Automated versioning and publishing of workspaces; similar to release-it, but for monorepos. Use it in the <a href="#cli">command line</a> or via <a href="#functional-utility">async function</a>. The tool intuitively works with existing npm verison/publish lifecycle hooks.</p>
<p align="center">
  <a href="https://www.npmjs.com/package/release-workspaces"><img src="https://img.shields.io/npm/v/release-workspaces.svg?sanitize=true&style=flat-square" alt="Version"></a>
  <a href="https://github.com/geotrev/release-workspaces/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/release-workspaces.svg?sanitize=true&style=flat-square" alt="License"></a>
  <a href="https://github.com/geotrev/release-workspaces/actions/workflows/test.yml?query=branch%3Amain"><img src="https://badgen.net/github/checks/geotrev/release-workspaces/main?style=flat-square" alt="CI status" /></a>
</p>

## Why

There's many awesome tools to automate publishing npm packages. The problem is that they're either deprecated/retired, suited specifically for singular packages and therefore become brittle in a monorepo context, or bring along additional tooling that is unnecessary for owners looking to simply automate the versioning + publishing process.

## Configuration

While the tool runs with sensible defaults, you can create a configuration of your own with the following options/overrides.

Define the config file one of few ways:

- `.release-workspaces.json` file in monorepo root
- `"release-workspaces"` field of package.json
- `--config` CLI option for a custom JSON file path

### Options

Default values denoted after each field.

```js
{
  // Defines how codependent monorepo packages are versioned during a release
  "increment": {
    // If false, will not bump codependent package versions.
    "codependencies": true,

    // Range prefix to use when incrementing codependent packages
    "rangePrefix": "^"
  },

  // Defines scripts during release-workspaces execution lifecycle
  "hooks": {
    // Runs before all packages are versioned and published.
    "prepublish": "",

    // Runs after all packages are versioned and published
    "postpublish": "",

    // Runs before the release commit is created
    "precommit": "",

    // Runs after the release commit is created
    "postcommit": ""
  },

  // Controls version and publish behavior
  "npm": {
    // If false, does not increment the version
    "increment": true,

    // If false, does not publish the package
    // NOTE: If `increment` is false, the tool will still attempt to publish
    "publish": true
  },

  // Controls the commit and tag behavior
  "git": {
    // The commit message for the release commit
    "commitMessage": "Release ${version}",

    // The tag message for the release commit
    "tagMessage": "Release ${version}",

    // If false, file changes created during the release are not commited
    "commit": true,

    // If false, will not tag your commit with the new version
    // NOTE: If `commit` is `false`, the tool will still attempt tagging the previous commit
    "tag": true
  }
}
```

If you need to run a package-specific npm lifecycle script such as `preversion` or `prepublishOnly`, defining them in the package's `package.json` is all you need to do.

## CLI

Version and publish your packages through the CLI.

Arguments passed through the CLI will be passed verbatim to and validated by [semver](https://www.npmjs.com/package/semver) (`semver.inc`, specifically) under the hood. This works great from both an implementation and user experience perspective, as it mirrors 1:1 how npm handles versioning, anyway, and fails naturally if a combination of arguments is invalid (e.g., no `--target` flag is given)

### Core Options

| Name        | Alias | Type    | Required | Description                                                                        |
| ----------- | ----- | ------- | -------- | ---------------------------------------------------------------------------------- |
| `--target`  | `t`   | string  | Y        | The target semver increment. E.g. `minor`, `prepatch`, `prerelease`, etc.          |
| `--preid`   | `p`   | string  | N        | If given, will set the version as a prerelease. E.g. `alpha`, `rc`, etc.           |
| `--npm-tag` | `n`   | string  | N        | If given, sets the npm tag. Otherwise uses the `preid`. E.g. `next`.               |
| `--config`  | `c`   | string  | N        | Define a custom file path and/or name.                                             |
| `--dry-run` | `d`   | boolean | N        | If given, prints commands configured to run by the tool, but doesn't execute them. |
| `--verbose` |       | boolean | N        | Like `dry-run`, but runs all commands                                              |

Simple example:

```sh
# 1.5.0 -> 2.0.0
$ release-workspaces --target major
```

Complex example:

```sh
# 1.5.0 -> 2.0.0-rc.0 (@next)
$ release-workspaces --config path/to/my-config.json --target premajor --preid rc --npm-tag next
```

### Config Options

Instead of defining a config file, you can instead use CLI flag equivalents.

## Functional Utility

You can also use `release` as an async function. Useful if you are tying in the tool to existing scripts for your project.

`release` takes two arguments: `options` and `config`, both being optional if you're comfortable with the default options and/or have a config defined in your project directory, respectively.

All entries in `options` correlate one-to-one with CLI options.

Example:

```js
import { release } from "release-workspaces

const options = {
  target: "preminor",
  preid: "alpha",
  dryRun: true,
  verbose: true,
}

const config = {
  git: {
    commit: false,
  },
  hooks: {
    "preincrement": "npm test",
  },
  increment: {
    rangePrefix: "~",
  },
}

/* do some other stuff */

await release(options, config)

/* do some more stuff */
```

## Examples

Here's a straightforward example of versioning and publishing your workspace packages from prerelease to release candidate (rc) to final.

```sh
# Starting version: 0.1.0
$ release-workspaces --target preminor --preid alpha # 0.2.0-alpha.0
$ release-workspaces --target prerelease # 0.2.0-alpha.1
$ release-workspaces --target prerelease --preid rc --npm-tag next # 0.2.0-rc.0 (using 'next' npm tag)
$ release-workspaces --target minor # 0.2.0
```

## Roadmap

- [ ] Automate GitHub/GitLab releases

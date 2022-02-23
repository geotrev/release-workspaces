<h2 align="center">release-workspaces</h2>
<p align="center">Automated versioning and publishing of workspaces; similar to release-it, but for workspace monorepos. Use it in the <a href="#cli">command line</a> or via <a href="#functional-utility">async function</a>. The tool intuitively works with existing npm verison/publish lifecycle hooks.</p>
<br>
<p align="center">
  <a href="https://www.npmjs.com/package/release-workspaces"><img src="https://img.shields.io/npm/v/release-workspaces.svg?sanitize=true&style=flat-square" alt="Version"></a>
  <a href="https://github.com/geotrev/release-workspaces/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/release-workspaces.svg?sanitize=true&style=flat-square" alt="License"></a>
  <a href="https://github.com/geotrev/release-workspaces/actions/workflows/test.yml?query=branch%3Amain"><img src="https://badgen.net/github/checks/geotrev/release-workspaces/main?style=flat-square" alt="CI status" /></a>
</p>

### Why

There's many awesome tools to automate publishing npm packages. The problem is that they're either deprecated/retired, suited specifically for singular packages and therefore become brittle in a monorepo context, or bring along additional tooling that is unnecessary for owners looking to simply automate the versioning + publishing process.

## Configuration

While the tool runs with sensible defaults, you can create a configuration of your own with the following options/overrides.

You can define a configuration in a few weeks. Add a `.release-workspaces.json` file or a `release-workspaces` field in your `package.json`

### Options

Default values denoted after each field.

```js
{
  "increment": {
    // Ensures packages within the monorepo have the correct version before publishing
    "codependencies": true,

    // Range prefix for codependencies
    "rangePrefix": "^"
  },
  "hooks": {
    // Runs before packages are versioned and published
    "preincrement": "",

    // Runs after packages are versioned and published
    "postincrement": "",

    // Runs before the release commit is created
    "precommit": "",

    // Runs after the release commit is created
    "postcommit": ""
  },
  "npm": {
    // If false, does not increment the version
    "increment": true,

    // If false, does not publish the package
    // NOTE: If `increment` is false, the tool will still attempt to publish
    "publish": true
  },
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

The only required option for the tool is `target`, which should be any valid semver increment.

Simple example:

```sh
$ release-workspaces --target minor
```

Complex example:

```sh
$ release-workspaces --config path/to/my-config.json --target preminor --preid rc --npm-tag next
```

### Flags

| Name        | Alias | Required | Description                                                                                                                                  |
| ----------- | ----- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `--config`  | `c`   | N        | Define a custom file path and/or name.                                                                                                       |
| `--target`  | `t`   | Y        | The target semver increment. E.g. `minor`, `prepatch`, etc.                                                                                  |
| `--preid`   | `p`   | N        | If given, will set the version as a prerelease. E.g. `alpha`, `rc`, etc.                                                                     |
| `--npm-tag` | `n`   | N        | If given, sets the npm tag. Otherwise uses the `preid`. E.g. `next`.                                                                         |
| `--dry-run` | `d`   | N        | If given, prints commands the tool would run given a user's current configuration, and packages that would be updated, but doesn't run them. |
| `--verbose` |       | N        | Like `dry-run`, but actually runs all commands                                                                                               |

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

## Roadmap

- [ ] Automate GitHub/GitLab releases

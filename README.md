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

### Options

See all options and their default values [here](bin/helpers/config-default.js).

If you need to run a package-specific npm lifecycle script such as `preversion` or `prepublishOnly`, defining them in the package's `package.json` is all you need to do.

## CLI

Version and publish your packages through the CLI.

Arguments passed through the CLI will be passed verbatim to and validated by [semver](https://www.npmjs.com/package/semver) (`semver.inc`, specifically) under the hood. This works great from both an implementation and user experience perspective, as it mirrors 1:1 how npm handles versioning anyway, and fails naturally if a combination of arguments is invalid (e.g., no `--target` given but `--preid` is)

### Core Options

Since you can disable any and all facets of the release lifecycle through the config file, none of these options are strictly required.

| Name        | Alias | Type    | Description                                                                        |
| ----------- | ----- | ------- | ---------------------------------------------------------------------------------- |
| `--target`  | `t`   | string  | The target semver increment. E.g. `minor`, `prepatch`, `prerelease`, etc.          |
| `--preid`   | `p`   | string  | If given, will set the version as a prerelease. E.g. `alpha`, `rc`, etc.           |
| `--npm-tag` | `n`   | string  | If given, sets the npm tag. Otherwise uses the `preid`. E.g. `next`.               |
| `--dry-run` | `d`   | boolean | If given, prints commands configured to run by the tool, but doesn't execute them. |
| `--verbose` |       | boolean | Like `dry-run`, but runs all commands.                                             |

Simple example:

```sh
# 1.5.0 -> 2.0.0
$ release-workspaces --target major
```

Complex example:

```sh
# 1.5.0 -> 2.0.0-rc.0 (@next)
$ release-workspaces --target premajor --preid rc --npm-tag next
```

### Config Options

Passing in CLI config options will override your config file. Useful for one-off releases and custom npm scripts meant to augment a base configuration.

For example, say you don't want to version, publish, or commit any changes in your current repo, but instead just tag the latest commit with the current version:

```sh
$ release-workspaces --no-npm.increment --no-npm.publish --no-git.commit
```

Note that **any boolean config option** can be negated by prepending `--no-`, not just those shown above.

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

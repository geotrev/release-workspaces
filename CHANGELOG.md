# [0.2.0](https://github.com/geotrev/release-workspaces/compare/v0.1.6...v0.2.0) (2022-02-27)


### Features

* adds ref status check during initialize ([89a6fe3](https://github.com/geotrev/release-workspaces/commit/89a6fe3bcb0f74481ff25f2c60422d331fdb1a64))
* enable specific/custom publish version ([82b8bdc](https://github.com/geotrev/release-workspaces/commit/82b8bdc5779edffce2b91abf3d26242b2cda2ab3))
* prevent release if working dir isn't clean ([9818e71](https://github.com/geotrev/release-workspaces/commit/9818e71e31b7eacca8528848fe6482636a0cf9ef))

## [0.1.7](https://github.com/geotrev/release-workspaces/compare/v0.1.6...v0.1.7) (2022-02-27)


### Features

* adds ref status check during initialize ([89a6fe3](https://github.com/geotrev/release-workspaces/commit/89a6fe3bcb0f74481ff25f2c60422d331fdb1a64))
* enable specific/custom publish version ([82b8bdc](https://github.com/geotrev/release-workspaces/commit/82b8bdc5779edffce2b91abf3d26242b2cda2ab3))
* prevent release if working dir isn't clean ([9818e71](https://github.com/geotrev/release-workspaces/commit/9818e71e31b7eacca8528848fe6482636a0cf9ef))

## [0.1.6](https://github.com/geotrev/release-workspaces/compare/v0.1.5...v0.1.6) (2022-02-25)


### Bug Fixes

* fix incorrect retrieval of root package.json ([a3f4779](https://github.com/geotrev/release-workspaces/commit/a3f47795b85b4cc57a32fe05f6e7ee17878b4435))

## [0.1.5](https://github.com/geotrev/release-workspaces/compare/v0.1.4...v0.1.5) (2022-02-25)


### Bug Fixes

* optional chain check when writing version back to package.json ([c0545f5](https://github.com/geotrev/release-workspaces/commit/c0545f5059abfcc1f080a58e425db2a78a97e669))

## [0.1.4](https://github.com/geotrev/release-workspaces/compare/v0.1.3...v0.1.4) (2022-02-25)


### Features

* automatically update config and/or root package.json with release version after publish ([1457692](https://github.com/geotrev/release-workspaces/commit/145769260ea2949799495532fb3578205ac7d1bc))
* derive version from root package or config file ([4e25626](https://github.com/geotrev/release-workspaces/commit/4e25626932e87154ecae6501838ab372df16ff6f))

## [0.1.3](https://github.com/geotrev/release-workspaces/compare/v0.1.2...v0.1.3) (2022-02-24)

### Bug Fixes

- include helper files ([b91e551](https://github.com/geotrev/release-workspaces/commit/b91e55145a679b079f3bb5499429bb52a4d21fb0))

## [0.1.2](https://github.com/geotrev/release-workspaces/compare/v0.1.1...v0.1.2) (2022-02-24)

### Bug Fixes

- adds error exit when cmd calls fail ([62ceaea](https://github.com/geotrev/release-workspaces/commit/62ceaeac3a40a7a181405e49c36ce092487f7a8a))
- update private package version, but don't publish ([f52b26d](https://github.com/geotrev/release-workspaces/commit/f52b26dffdf79f3df4f42fc2cc1bcf18fe18412e))
- use full tag name for annotated tag ([24661f7](https://github.com/geotrev/release-workspaces/commit/24661f775b34fa1a7d2e43ab8458955b2e43c21d))
- uses existing version for commit and tag messages in release ([097d04d](https://github.com/geotrev/release-workspaces/commit/097d04d5cc08f23b2a464cd8dc406c923c9968ce))

## [0.1.1](https://github.com/geotrev/release-workspaces/compare/v0.1.0...v0.1.1) (2022-02-24)

### Features

- adds additional hooks to lifecycle events ([34410df](https://github.com/geotrev/release-workspaces/commit/34410df71187eb14a9c831a31fef665038409fcb))
- allows config options to be added on the command line ([addf77e](https://github.com/geotrev/release-workspaces/commit/addf77ef1ae5b6c1c7c130a21d70fc121eb16464))
- allows user to disable npm increment, publish and git commit, tag steps individually ([3f65649](https://github.com/geotrev/release-workspaces/commit/3f65649b2af3ecbc1b71dc1c67e931de07e55df0))
- derive the npm tag if none of the appropriate CLI flags are given ([fe984e6](https://github.com/geotrev/release-workspaces/commit/fe984e6d8b5bf122922aef31bd56b9a3503ccae4))
- enables verbose logging during execution ([a14c453](https://github.com/geotrev/release-workspaces/commit/a14c453ebd75039d5dc9d2197891776f56df019c))

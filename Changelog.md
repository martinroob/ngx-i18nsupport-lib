<a name="0.1.2"></a>
# [0.1.2](https://github.com/martinroob/ngx-i18nsupport-lib/compare/v0.1.2...v0.1.0) (2017-05-05)

### Bug Fixes

* **XLIFF 2.0:** fixed "useSourceAsTarget in XLIFF 2.0 does not work". ([#4](https://github.com/martinroob/ngx-i18nsupport-lib/issues/4)).

* **all formats** wrong error message when trans unit contains no ID

<a name="0.1.0"></a>
# [0.1.0](https://github.com/martinroob/ngx-i18nsupport-lib/compare/v0.1.0...v0.0.8) (2017-05-05)

Started issue tracking and git workflow with this release. All work is now always done in a feature branch and merged to master, when it is ready to release.

### Features

* **XLIFF 2.0:** added support for working with XLIFF 2.0 format. ([#1](https://github.com/martinroob/ngx-i18nsupport-lib/issues/1)).

<a name="0.0.8"></a>
# [0.0.8](https://github.com/martinroob/ngx-i18nsupport-lib/compare/v0.0.8...v0.0.7) (2017-05-03)

### Bug Fixes

* `removeTransUnitWithId` did not work

<a name="0.0.7"></a>
# [0.0.7](https://github.com/martinroob/ngx-i18nsupport-lib/compare/v0.0.7...v0.0.6) (2017-05-02)

### Bug Fixes

* normalizedContent did not work correctly. This was caused by differences in writing empty elements between xmldom and cheerio.

<a name="0.0.6"></a>
# [0.0.6](https://github.com/martinroob/ngx-i18nsupport-lib/compare/v0.0.6...v0.0.5) (2017-05-01)

### Bug Fixes

* first stable version

### Features

* replaced cheerio by xmldom
* added support for handling of source elements (references to angular template files)

<a name="0.0.5"></a>
# [0.0.5](https://github.com/martinroob/ngx-i18nsupport-lib/compare/v0.0.5...v0.0.1) (2017-04-28)

### Bug Fixes

* **work in progress:** version for experiments, not to be used in production

# 0.0.1 (2017-04-09)

Initial version based on ngx-i18nsupport 0.2.3.

Extracted the API relevant code into this new module.
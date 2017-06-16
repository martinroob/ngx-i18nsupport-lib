<a name="1.4.3"></a>
# [1.4.3](https://github.com/martinroob/ngx-i18nsupport-lib/compare/v1.4.3...v1.4.2) (2017-06-16)

### Bug Fixes

* **all formats** Linebreaks are not handled in NormalizedMessage ([#31](https://github.com/martinroob/ngx-i18nsupport-lib/issues/31)).
To fix this, empty tags like `<br/>` or `<img/>`are introduced.

<a name="1.4.2"></a>
# [1.4.2](https://github.com/martinroob/ngx-i18nsupport-lib/compare/v1.4.2...v1.4.1) (2017-06-09)

### Bug Fixes

* **ICU messages** ICU message containing string `select` or `plural` in message cannot be parsed ([#29](https://github.com/martinroob/ngx-i18nsupport-lib/issues/29)).

<a name="1.4.1"></a>
# [1.4.1](https://github.com/martinroob/ngx-i18nsupport-lib/compare/v1.4.1...v1.3.1) (2017-06-09)

### Features

* **API** Add support for ICU message usage ([#25](https://github.com/martinroob/ngx-i18nsupport-lib/issues/25)).

<a name="1.3.1"></a>
# [1.3.1](https://github.com/martinroob/ngx-i18nsupport-lib/compare/v1.3.1...v1.3.0) (2017-06-02)

### Bug Fixes

* **all formats** problems with parsing messages that contain same tag multiple times ([#26](https://github.com/martinroob/ngx-i18nsupport-lib/issues/26)).

<a name="1.3.0"></a>
# [1.3.0](https://github.com/martinroob/ngx-i18nsupport-lib/compare/v1.3.0...v1.2) (2017-05-26)

### Features

* **API** new API method supportsSetSourceReferences to check wether source refs can be written ([#23](https://github.com/martinroob/ngx-i18nsupport-lib/issues/23)).

### Bug Fixes

* **XMB** xmb files should not be translatable at all ([#22](https://github.com/martinroob/ngx-i18nsupport-lib/issues/22)).

* **XTB** When reading xtb with wrong master xmb, the resulting error is confusing ([#21](https://github.com/martinroob/ngx-i18nsupport-lib/issues/21)).

<a name="1.2.0"></a>
# [1.2.0](https://github.com/martinroob/ngx-i18nsupport-lib/compare/v1.2.0...v1.1.1) (2017-05-24)

### Features

* **XMB** Add xtb format support as translation of xmb ([#19](https://github.com/martinroob/ngx-i18nsupport-lib/issues/19)).

* **XLIFF 2.0** Add source ref support to XLIFF 2.0 format ([#18](https://github.com/martinroob/ngx-i18nsupport-lib/issues/18)).

<a name="1.1.1"></a>
# [1.1.1](https://github.com/martinroob/ngx-i18nsupport-lib/compare/v1.1.1...v1.1.0) (2017-05-21)

### Bug Fixes

* Type Number should be number in sourceRef-API

<a name="1.1.0"></a>
# [1.1.0](https://github.com/martinroob/ngx-i18nsupport-lib/compare/v1.1.0...v1.0.1) (2017-05-21)

### Features

* **API** add an API function to create normalized message from native xml ([#13](https://github.com/martinroob/ngx-i18nsupport-lib/issues/13)).

* **API** add an API function to set sourceReferences ([#14](https://github.com/martinroob/ngx-i18nsupport-lib/issues/14)).

<a name="1.0.1"></a>
# [1.0.1](https://github.com/martinroob/ngx-i18nsupport-lib/compare/v1.0.1...v1.0.0) (2017-05-19)

### Bug Fixes

* **all formats:** fixed "A linebreak in a message throws exception 'token not recognized'". ([#11](https://github.com/martinroob/ngx-i18nsupport-lib/issues/11)).

* **XLIFF 1.2:** fixed "Typo in errormessage for XLIFF 1.2 files". ([#10](https://github.com/martinroob/ngx-i18nsupport-lib/issues/10)).

<a name="1.0.0"></a>
# [1.0.0](https://github.com/martinroob/ngx-i18nsupport-lib/compare/v1.0.0...v0.1.3) (2017-05-18)

### Features

* **API** API has been sligtly changed to support new features (especially normalized messages)

* **API** add format independent translation messages (normalized messages) ([#2](https://github.com/martinroob/ngx-i18nsupport-lib/issues/2)).

* **API** normalize state and add setter to API ([#8](https://github.com/martinroob/ngx-i18nsupport-lib/issues/8)).

<a name="0.1.3"></a>
# [0.1.3](https://github.com/martinroob/ngx-i18nsupport-lib/compare/v0.1.3...v0.1.2) (2017-05-05)

### Bug Fixes

* **XLIFF 2.0:** fixed "placeholders in targetNormalized are wrong numbered". ([#6](https://github.com/martinroob/ngx-i18nsupport-lib/issues/6)).

<a name="0.1.2"></a>
# [0.1.2](https://github.com/martinroob/ngx-i18nsupport-lib/compare/v0.1.2...v0.1.0) (2017-05-05)

### Bug Fixes

* **XLIFF 2.0:** fixed "cloneWithSourceAsTarget in XLIFF 2.0 does not work". ([#4](https://github.com/martinroob/ngx-i18nsupport-lib/issues/4)).

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
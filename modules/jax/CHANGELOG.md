# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 7.0.0 - 2022-03-03

### Changed
- Upgraded to Katamari 9.0, which includes breaking changes to the `Optional` API used in this module.

### Removed
- Removed support for Microsoft Internet Explorer and legacy Microsoft Edge.

## 6.0.0 - 2021-08-26

### Improved
- Improved the `HttpError.responseText` type to track the actual `ResponseType`, instead of just `string`. This means that `HttpError` now requires a generic type that extends `keyof ResponseTypeMap`.

### Changed
- Upgraded to Katamari 8.0, which includes breaking changes to the `Optional` API used in this module.



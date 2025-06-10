# Description
`boss` is a project which provides a generic wrapper for document models - DomUniverse vs TestUniverse.

Like all modules in this monorepo (except for the hugerte module), this module is not considered public API and it may be changed at any time, no matter the corresponding HugeRTE version.

# Usage
`DomUniverse`: Provides utility functions for dealing with the DOM.
`TestUniverse`: Provides utility functions for dealing with atomic tests.
# Tests
`boss` uses [`bedrock`](https://www.npmjs.com/package/@ephox/bedrock) to run atomic tests.
## Running Tests
`$ yarn test`

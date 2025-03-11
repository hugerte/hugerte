# Description
`phoenix` is a project that handles DOM node text gathering.

Like all modules in this monorepo (except for the hugerte module), this module is not considered public API and it may be changed at any time, no matter the corresponding HugeRTE version.

# Usage
## Dom
`DomDescent`: Used to navigate through a node's children.
`DomGather`: Used to extract text around a given point.
## General
`Descent`: Used to navigate through a node's children with a given DOM universe.
`Gather`: Used to extract text around a given point with a given DOM universe.
`Split`: Used to split text nodes in a given element with a given DOM universe.
# Tests
`phoenix` uses [`bedrock`](https://www.npmjs.com/package/@ephox/bedrock) to run atomic tests.
## Running Tests
`$ yarn test`

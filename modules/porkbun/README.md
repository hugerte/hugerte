# Description
`porkbun` is an event handling framework for JavaScript.

Like all modules in this monorepo (except for the hugerte module), this module is not considered public API and it may be changed at any time, no matter the corresponding HugeRTE version.

# Usage
`Binder`: An event binder that allows binding and unbinding of events.
`Event`: A module that allows multiple handlers to be bound, unbound and triggered for an event.
`Events`: A module that allows multiple handlers to be bound, unbound and triggered for multiple events.
`SourceEvent`: An event sourced from another event.
# Tests
`porkbun` uses [`bedrock`](https://www.npmjs.com/package/@ephox/bedrock) to run atomic tests.
## Running Tests
`$ yarn test`

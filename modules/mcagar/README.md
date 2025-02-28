# Description

In this fork of TinyMCE, `mcagar` is a [`hugerte`](https://www.npmjs.com/package/hugerte) specific wrapping of the agar package's testing infrastructure. It is only a collection of modules.

Like all modules in this monorepo (except for the hugerte module), this module is not considered public API and it may be changed at any time, no matter the corresponding HugeRTE version.

# Usage

Only modules inside the `api` package should be used in other projects. All other modules are implementation detail. There are two types of modules available: BDD and Pipelines.

BDD modules are useful when testing using behavior-driven development testing, such as with Mocha. For information, see the [BDD testing](docs/bdd.md) documentation.

Pipeline modules are an in-house testing framework that relies on Agar Step and Chains to create a pipeline of actions to perform. The pipeline syntax is, at the time of writing, slowly being removed and will eventually be deprecated. For information, see the [Pipeline testing](docs/pipelines.md) documentation.

# Running tests

The tests can be run using `bedrock` via `yarn test`. Note, this will only run the tests on Chrome and will require `chromedriver`. You can use `bedrock` directly to test on other browsers. See [`bedrock`](https://www.npmjs.com/package/@ephox/bedrock) for more details.

To run the tests on Chrome:

`$ yarn test`

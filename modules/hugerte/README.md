HugeRTE - JavaScript Library for Rich Text Editing
===================================================

Building HugeRTE
-----------------
See the monorepo root readme file for installation instructions.

Now, build HugeRTE by using `grunt`. If you don't have `grunt-cli` installed globally, prefix with `yarn` to execute the local grunt.
```
$ yarn grunt
```

Build tasks
------------
`grunt`
Lints, compiles, minifies and creates release packages for HugeRTE. This will produce the production ready packages.

`grunt start`
Starts a webpack-dev-server that compiles the core, themes, plugins and all demos. Go to `localhost:3000` for a list of links to all the demo pages.

`grunt dev`
Runs tsc, webpack and less. This will only produce the bare essentials for a development build and is a lot faster.

`grunt test`
Runs all tests on chrome-headless.

`grunt bedrock-manual`
Runs all tests manually in a browser.

`grunt bedrock-auto:<browser>`
Runs all tests through selenium browsers supported are chrome, firefox, ie, MicrosoftEdge, and chrome-headless.

`grunt webpack:core`
Builds the demo js files for the core part of hugerte this is required to get the core demos working.

`grunt webpack:plugins`
Builds the demo js files for the plugins part of hugerte this is required to get the plugins demos working.

`grunt webpack:themes`
Builds the demo js files for the themes part of hugerte this is required to get the themes demos working.

`grunt webpack:<name>-plugin`
Builds the demo js files for the specific plugin.

`grunt webpack:<name>-theme`
Builds the demo js files for the specific theme.

`grunt --help`
Displays the various build tasks.

Bundle themes and plugins into a single file
---------------------------------------------
`grunt bundle --themes=silver --plugins=table,paste`

Minifies the core, adds the silver theme and adds the table and paste plugin into hugerte.min.js.

Contributing to the HugeRTE project
------------------------------------
HugeRTE is an open source software project and we encourage developers to contribute patches and code to be included in the main package of HugeRTE.

__Basic Rules__

* Contributed code will be licensed under the MIT license
* Copyright notices will be changed to HugeRTE team, contributors will get credit for their work
* All third party code will be reviewed, tested and possibly modified before being released

__How to Contribute to the Code__

The HugeRTE source code is [hosted on Github](https://github.com/hugerte/hugerte). Through Github you can submit pull requests and log new bugs and feature requests.

__How to Contribute to the Docs__

Docs are hosted on Github in the [hugerte-docs](https://github.com/hugerte/hugerte-docs) repo.

[How to contribute](https://github.com/hugerte/hugerte-docs/blob/main/CONTRIBUTING.md) to the docs, including a style guide, can be found on the GitHub repo.

The docs will soon be accessible from https://hugerte.org.

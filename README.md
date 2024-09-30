# HugeMCE

The 100% free fork of the world's #1 open source rich text editor.

Used and trusted by millions of developers, [TinyMCE](https://github.com/tinymce/tinymce) (the original project I've forked) is the world’s most customizable, scalable, and flexible rich text editor. They’ve helped launch the likes of Atlassian, Medium, Evernote (and lots more they can’t tell you), by empowering them to create exceptional content and experiences for their users.

With more than 350M+ downloads every year, they’re also one of the most trusted enterprise-grade open source HTML editors on the internet. There’s currently more than 100M+ products worldwide, powered by Tiny. As a high powered WYSIWYG editor, TinyMCE is built to scale, designed to innovate, and thrives on delivering results to difficult edge-cases.

Now, why do we need HugeMCE? Why can't we just continue using TinyMCE?

Well, TinyMCE's second-latest version (6), was licensed under the MIT license, which permits free use for everybody. But its latest version 7 is licensed under the GPL, which only permits use in open-source projects, and only in GPL-licensed ones at that. That's not what we want. Therefore, I've forked the 6.x version and will (hopefully, with a team soon) continue providing fixes and new features for it under the MIT license.

<p align="center">
  <img alt="Screenshot of the TinyMCE Editor" src="https://www.tiny.cloud/storage/github-readme-images/tinymce-editor-6x.png"\>
</p>

## Get started with HugeMCE

HugeMCE is a new project, just some days old. It's not yet available on NPM or anywhere. Information about installing it will be provided here as soon as it's ready. In the meantime, the rest of this document will provide you instructions to install the official 6.x version of TinyMCE. It will hopefully be trivial changing to HugeMCE later as soon as it's ready.

Getting started with the TinyMCE rich text editor is easy, and for simple configurations can be done in less than 5 minutes.

[TinyMCE Self-hosted Deployment Guide](https://www.tiny.cloud/docs/tinymce/6/npm-projects/)

TinyMCE provides a range of configuration options that allow you to integrate it into your application. Start customizing with a [basic setup](https://www.tiny.cloud/docs/tinymce/6/basic-setup/).

Configure it for one of three modes of editing:

- [TinyMCE classic editing mode](https://www.tiny.cloud/docs/tinymce/6/use-tinymce-classic/).
- [TinyMCE inline editing mode](https://www.tiny.cloud/docs/tinymce/6/use-tinymce-inline/).
- [TinyMCE distraction-free editing mode](https://www.tiny.cloud/docs/tinymce/6/use-tinymce-distraction-free/).

## Features

### Integration

TinyMCE is easily integrated into your projects with the help of components such as:

- [tinymce-react](https://github.com/tinymce/tinymce-react)
- [tinymce-vue](https://github.com/tinymce/tinymce-vue)
- [tinymce-angular](https://github.com/tinymce/tinymce-angular)

With over 29 integrations, and 400+ APIs, see the TinyMCE docs for a full list of editor [integrations](https://www.tiny.cloud/docs/tinymce/6/integrations/).

### Customization

It is easy to [configure the UI](https://www.tiny.cloud/docs/tinymce/6/customize-ui/) of your rich text editor to match the design of your site, product or application. Due to its flexibility, you can [configure the editor](https://www.tiny.cloud/docs/tinymce/6/basic-setup/) with as much or as little functionality as you like, depending on your requirements.

With [50+ powerful plugins available](https://www.tiny.cloud/tinymce/features/), and content editable as the basis of TinyMCE, adding additional functionality is as simple as including a single line of code.

Realizing the full power of most plugins requires only a few lines more.

### Extensibility

Sometimes your editor requirements can be quite unique, and you need the freedom and flexibility to innovate. Thanks to TinyMCE being open source, you can view the source code and develop your own extensions for custom functionality to meet your own requirements.

The TinyMCE [API](https://www.tiny.cloud/docs/tinymce/6/apis/tinymce.root/) is exposed to make it easier for you to write custom functionality that fits within the existing framework of TinyMCE [UI components](https://www.tiny.cloud/docs/tinymce/6/custom-ui-components/).

## Compiling and contributing

In 2019 the decision was made to transition our codebase to a monorepo. For information on compiling and contributing, see: [contribution guidelines](https://github.com/tinymce/tinymce/blob/master/CONTRIBUTING.md).

As an open source product, we encourage and support the active development of our software.

## Want more information?

Visit the [TinyMCE website](https://tiny.cloud/) and check out the [TinyMCE documentation](https://www.tiny.cloud/docs/).

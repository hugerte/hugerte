import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from "@hugerte/wrap-mcagar";
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';
import * as IframeContent from 'hugerte/plugins/preview/core/IframeContent';
import Plugin from 'hugerte/plugins/preview/Plugin';

describe('browser.hugerte.plugins.preview.PreviewContentStyleTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'preview',
    base_url: '/project/hugerte/js/hugerte'
  }, [ Plugin ]);

  const assertIframeContains = (editor: Editor, text: string, shouldMatch: boolean) => {
    const actual = IframeContent.getPreviewHtml(editor);
    const regexp = new RegExp(text);

    if (shouldMatch) {
      assert.match(actual, regexp, 'Should be the same html');
    } else {
      assert.notMatch(actual, regexp, 'Should not be the same html');
    }
  };

  const assertIframeHtmlContains = (editor: Editor, text: string) => assertIframeContains(editor, text, true);

  const assertIframeHtmlNotContains = (editor: Editor, text: string) => assertIframeContains(editor, text, false);

  it('TBA: Set content, set style setting and assert content and style. Delete style and assert style is removed', () => {
    const editor = hook.editor();
    editor.setContent('<p>hello world</p>');
    editor.options.set('content_style', 'p {color: blue;}');
    assertIframeHtmlContains(editor, '<style type="text/css">p {color: blue;}</style>');
    editor.options.unset('content_style');
    assertIframeHtmlNotContains(editor, '<style type="text/css">p {color: blue;}</style>');
  });

  it('TINY-6529: Set content, set style settings and assert content and styles. content_style should take precedence.', () => {
    const editor = hook.editor();
    const contentCssUrl = editor.documentBaseURI.toAbsolute('/project/hugerte/js/hugerte/skins/content/default/content.css');
    editor.setContent('<p>hello world</p>');
    editor.options.set('content_css_cors', true);
    editor.options.set('content_style', 'p {color: blue;}');
    assertIframeHtmlContains(editor, `<link type="text/css" rel="stylesheet" href="${contentCssUrl}" crossorigin="anonymous"><style type="text/css">p {color: blue;}</style>`);
  });
});

import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/media/Plugin';

import * as Utils from '../module/test/Utils';

// TODO TINY-10480: Investigate flaky tests
describe.skip('browser.hugerte.plugins.media.core.MediaEmbedTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: [ 'media' ],
    toolbar: 'media',
    media_url_resolver: (data: { url: string }, resolve: (response: { html: string }) => void) => {
      resolve({
        html: '<video width="300" height="150" ' +
          'controls="controls">\n<source src="' + data.url + '" />\n</video>'
      });
    },
    base_url: '/project/hugerte/js/hugerte'
  }, [ Plugin ]);

  it('TBA: Embed content, open dialog, set size and assert custom media_url_resolver formatting', async () => {
    const editor = hook.editor();
    await Utils.pTestEmbedContentFromUrl(editor,
      'https://www.youtube.com/watch?v=b3XFjWInBog',
      '<video width="300" height="150" controls="controls">\n' +
      '<source src="https://www.youtube.com/watch?v=b3XFjWInBog" />\n</video>'
    );
    await Utils.pTestEmbedContentFromUrl(editor,
      'https://www.google.com',
      '<video width="300" height="150" controls="controls">\n' +
      '<source src="https://www.google.com" />\n</video>'
    );
    await Utils.pAssertSizeRecalcConstrained(editor);
    await Utils.pAssertSizeRecalcUnconstrained(editor);
    editor.setContent('');
    await Utils.pAssertSizeRecalcConstrainedReopen(editor);
  });
});

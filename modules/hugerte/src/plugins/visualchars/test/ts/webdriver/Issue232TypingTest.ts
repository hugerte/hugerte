import { RealKeys, Waiter } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/visualchars/Plugin';

describe('webdriver.hugerte.plugins.visualchars.Issue232TypingTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'visualchars',
    toolbar: 'visualchars',
    visualchars_default_state: true,
    base_url: '/project/hugerte/js/hugerte'
  }, [ Plugin ], true);

  beforeEach(() => {
    hook.editor().setContent('');
  });

  // TINY-232: With visualchars enabled, the trailing placeholder nbsp is wrapped in a span.
  // When typing continues after it, the nbsp is no longer a placeholder and should be converted
  // to a regular space (Firefox inserts the new text into a separate text node after the span,
  // so the caret container never contains the nbsp).
  it('TINY-232: typing after a trailing wrapped nbsp converts it to a regular space', async () => {
    const editor = hook.editor();
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('word ') ]);

    // Wait for the debounced visualchars toggle to wrap the trailing nbsp in a span
    await Waiter.pWait(1000);

    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('word2') ]);

    // Wait for the debounced visualchars toggle to settle
    await Waiter.pWait(1000);

    TinyAssertions.assertContent(editor, '<p>word word2</p>');
  });
});

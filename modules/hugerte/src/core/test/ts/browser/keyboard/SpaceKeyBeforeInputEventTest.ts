import { Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'hugerte/core/api/Editor';

import { pressKeyAction, testBeforeInputEvent } from '../../module/test/BeforeInputEventUtils';

describe('browser.hugerte.core.delete.SpaceKeyBeforeInputEventTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/hugerte/js/hugerte'
  }, [], true);

  const testSpace = testBeforeInputEvent(pressKeyAction(Keys.space()), 'insertText');

  it('Gets beforeInput', () => {
    testSpace(hook.editor(), '<p>a <a href="#">b</a> c</p>', [ 0, 1, 0 ], 0, '<p>a <a href="#">&nbsp;b</a> c</p>', false);
  });

  it('Can prevent beforeInput', () => {
    testSpace(hook.editor(), '<p>a <a href="#">b</a> c</p>', [ 0, 1, 0 ], 0, '<p>a <a href="#">b</a> c</p>', true);
  });
});

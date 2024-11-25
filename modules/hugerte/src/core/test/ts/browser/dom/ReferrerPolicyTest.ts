import { after, describe, it } from '@ephox/bedrock-client';
import { McEditor } from "@hugerte/wrap-mcagar";
import { assert } from 'chai';

import DOMUtils from 'hugerte/core/api/dom/DOMUtils';
import ScriptLoader from 'hugerte/core/api/dom/ScriptLoader';
import Editor from 'hugerte/core/api/Editor';

// TODO Find a way to test the referrerpolicy with ScriptLoader, as it removes the dom reference as soon as it's finished loading so we can't check
// via dom elements. For now we're just loading a script to make sure it doesn't completely die when loading.
describe('browser.hugerte.core.dom.ReferrerPolicyTest', () => {
  const settings = {
    base_url: '/project/hugerte/js/hugerte',
    menubar: false,
    toolbar: false
  };

  const assertReferrerLinkPresence = (editor: Editor, referrerPolicy: ReferrerPolicy, expected: boolean) => {
    const links = editor.getDoc().querySelectorAll(`link[referrerpolicy="${referrerPolicy}"]`);
    assert.equal(links.length > 0, expected, `should have link with referrerpolicy="${referrerPolicy}"`);
  };

  const pLoadScript = (url: string): Promise<void> =>
    ScriptLoader.ScriptLoader.loadScript(url);

  after(() => {
    // Clean up by resetting the globals referrer policy
    ScriptLoader.ScriptLoader._setReferrerPolicy('');
    DOMUtils.DOM.styleSheetLoader._setReferrerPolicy('');
  });

  it('assert referrerpolicy presence with no setting set', async () => {
    const editor = await McEditor.pFromSettings<Editor>(settings);
    await pLoadScript('/project/hugerte/src/core/test/assets/js/test.js');
    assertReferrerLinkPresence(editor, 'origin', false);
    McEditor.remove(editor);
  });

  it('assert referrerpolicy presence with setting set', async () => {
    const editor = await McEditor.pFromSettings<Editor>({ ...settings, referrer_policy: 'origin' });
    await pLoadScript('/project/hugerte/src/core/test/assets/js/test.js');
    assertReferrerLinkPresence(editor, 'origin', true);
    McEditor.remove(editor);
  });
});

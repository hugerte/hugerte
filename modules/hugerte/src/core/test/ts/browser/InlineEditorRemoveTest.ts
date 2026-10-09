import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';

describe('browser.hugerte.core.InlineEditorRemoveTest', () => {

  const settings = {
    inline: true,
    base_url: '/project/hugerte/js/hugerte'
  };

  const assertBogusNotExist = () => {
    UiFinder.findIn(SugarBody.body(), '[data-mce-bogus]').each(() => {
      throw new Error('Should not be any data-mce-bogus tags present');
    });
  };

  const testRemoveSelectedContent = async (content: string, selector: string, destroy: boolean, offscreen: boolean = true) => {
    const survivor = await McEditor.pFromSettings<Editor>(settings);
    const editor = await McEditor.pFromSettings<Editor>(settings);
    const target = editor.getBody();
    const survivorTarget = survivor.getBody();

    try {
      survivor.setContent('<p>Surviving editor</p>');
      editor.setContent(content);
      const expectedContent = editor.getContent();
      editor.focus();
      editor.selection.select(editor.dom.select(selector)[0]);
      editor.nodeChanged();

      assert.lengthOf(target.querySelectorAll('.mce-offscreen-selection'), offscreen ? 1 : 0, 'Expected selection implementation is active');
      assert.equal(target.querySelector(selector)?.getAttribute('data-mce-selected'), '1', 'Original content is selected');
      let blurred = false;
      editor.on('blur', () => blurred = true);

      if (destroy) {
        editor.destroy();
      } else {
        editor.remove();
      }

      assert.isFalse(blurred, 'Removal does not depend on a preceding blur');
      assert.isTrue(target.isConnected, 'Application-owned inline target survives');
      assert.equal(target.innerHTML, expectedContent, 'Original content survives without editor artifacts');
      assert.isNull(target.querySelector('.mce-offscreen-selection'), 'Offscreen selection is removed');
      assert.isNull(target.querySelector('[data-mce-selected]'), 'Selection markers are removed');
      assert.strictEqual(survivor.getBody(), survivorTarget, 'Other editor retains its target');
      assert.isFalse(survivor.removed, 'Other editor remains live');
      survivor.setContent('<p>Still editable</p>');
      assert.equal(survivor.getContent(), '<p>Still editable</p>');

      editor.remove();
      editor.destroy();
      assert.equal(target.innerHTML, expectedContent, 'Repeated removal is safe');
    } finally {
      McEditor.remove(editor);
      McEditor.remove(survivor);
    }
  };

  it('Removing an inline editor with a selected image cleans up selection DOM without blur', async () => {
    await testRemoveSelectedContent('<p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="image"></p>', 'img', false, false);
  });

  it('Removing an inline editor with selected noneditable content cleans up selection DOM without blur', async () => {
    await testRemoveSelectedContent('<p contenteditable="false">Noneditable content</p>', 'p[contenteditable="false"]', false);
  });

  it('Destroying an inline editor with selected noneditable content cleans up selection DOM without blur', async () => {
    await testRemoveSelectedContent('<p contenteditable="false">Noneditable content</p>', 'p[contenteditable="false"]', true);
  });

  it('Removing inline editor should remove all data-mce-bogus tags', async () => {
    const editor = await McEditor.pFromSettings<Editor>(settings);
    editor.setContent('<p data-mce-bogus="all">b</p><p data-mce-bogus="1">b</p>', { format: 'raw' });
    editor.remove();
    assertBogusNotExist();
    McEditor.remove(editor);
  });
});

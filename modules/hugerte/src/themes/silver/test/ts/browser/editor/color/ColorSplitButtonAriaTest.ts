import { describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Attribute, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';

describe('browser.hugerte.themes.silver.editor.color.ColorSplitButtonAriaTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/hugerte/js/hugerte',
    toolbar: 'forecolor backcolor custom-split',
    setup: (editor: Editor) => {
      editor.ui.registry.addSplitButton('custom-split', {
        tooltip: 'Custom split',
        presets: 'normal',
        fetch: (callback) => {
          callback([
            { type: 'choiceitem', text: 'Item', value: 'item' }
          ]);
        },
        onAction: Fun.noop,
        onItemAction: Fun.noop
      });
    }
  });

  const getButton = (selector: string) => {
    const element = SugarBody.body().dom.querySelector<HTMLElement>(selector);
    assert.isNotNull(element, `Could not find ${selector}`);
    return SugarElement.fromDom(element as HTMLElement);
  };

  it('TINY-8665: Colour split buttons are exposed as ordinary buttons without a pressed state', () => {
    hook.editor();

    // The palette-opening part of the colour controls must not be a toggle.
    assert.isFalse(Attribute.has(getButton('button[data-mce-name="forecolor-chevron"]'), 'aria-pressed'), 'forecolor chevron should not be pressed');
    assert.isFalse(Attribute.has(getButton('button[data-mce-name="backcolor-chevron"]'), 'aria-pressed'), 'backcolor chevron should not be pressed');

    // The primary colour action is an action, not a toggle, so it must not advertise a pressed state.
    assert.isFalse(Attribute.has(getButton('button[data-mce-name="forecolor"]'), 'aria-pressed'), 'forecolor main should not be pressed');
    assert.isFalse(Attribute.has(getButton('button[data-mce-name="backcolor"]'), 'aria-pressed'), 'backcolor main should not be pressed');
  });

  it('TINY-8665: Non-colour split buttons keep their toggle/pressed semantics', () => {
    hook.editor();

    assert.equal(Attribute.get(getButton('button[data-mce-name="custom-split"]'), 'aria-pressed'), 'false', 'custom split should still expose a pressed state');
    assert.isFalse(Attribute.has(getButton('button[data-mce-name="custom-split-chevron"]'), 'aria-pressed'), 'custom split chevron should not be pressed');
  });
});

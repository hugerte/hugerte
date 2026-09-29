import { UiFinder } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { Attribute, Css, SugarElement } from '@ephox/sugar';
import { McEditor, TinyDom } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';
import EditorManager from 'hugerte/core/api/EditorManager';

interface SplitButtonParts {
  readonly main: SugarElement<Element>;
  readonly chevron: SugarElement<Element>;
}

interface Radii {
  readonly topLeft: number;
  readonly topRight: number;
}

describe('browser.hugerte.themes.silver.editor.SplitButtonRtlTest', () => {
  before(() => {
    // Register an RTL language so that the editor UI is rendered with dir=rtl.
    EditorManager.addI18n('ar', {
      _dir: 'rtl'
    });
  });

  const pCreateEditor = (language: string) =>
    McEditor.pFromSettings<Editor>({
      base_url: '/project/hugerte/js/hugerte',
      language,
      toolbar: 'forecolor'
    });

  const pGetSplitButtonParts = async (editor: Editor): Promise<SplitButtonParts> => {
    const container = TinyDom.container(editor);
    const main = await UiFinder.pWaitFor<Element>(
      'Wait for the forecolor split button primary action to be rendered',
      container,
      'button[data-mce-name="forecolor"]'
    );
    const chevron = await UiFinder.pWaitFor<Element>(
      'Wait for the forecolor split button chevron to be rendered',
      container,
      'button[data-mce-name="forecolor-chevron"]'
    );
    return { main, chevron };
  };

  const getRadii = (element: SugarElement<Element>): Radii => ({
    topLeft: parseFloat(Css.get(element, 'border-top-left-radius')),
    topRight: parseFloat(Css.get(element, 'border-top-right-radius'))
  });

  const assertRounded = (label: string, value: number, side: string) =>
    assert.isAbove(value, 0, `${label} should have a rounded outer (${side}) corner`);

  const assertSquare = (label: string, value: number, side: string) =>
    assert.equal(value, 0, `${label} should have a square inner (${side}) corner`);

  const assertMirrored = (label: string, ltr: Radii, rtl: Radii) => {
    assert.equal(rtl.topLeft, ltr.topRight, `${label}: RTL top-left radius should match the LTR top-right radius`);
    assert.equal(rtl.topRight, ltr.topLeft, `${label}: RTL top-right radius should match the LTR top-left radius`);
  };

  it('GH-81: The colour split button rounds its outer corners and squares the meeting edge in LTR', async () => {
    const editor = await pCreateEditor('en');
    const { main, chevron } = await pGetSplitButtonParts(editor);

    const mainRadii = getRadii(main);
    const chevronRadii = getRadii(chevron);

    assertRounded('LTR action part', mainRadii.topLeft, 'left');
    assertSquare('LTR action part', mainRadii.topRight, 'right');
    assertSquare('LTR palette part', chevronRadii.topLeft, 'left');
    assertRounded('LTR palette part', chevronRadii.topRight, 'right');

    McEditor.remove(editor);
  });

  it('GH-81: The colour split button mirrors the rounded corners in RTL', async () => {
    const editor = await pCreateEditor('ar');
    const { main, chevron } = await pGetSplitButtonParts(editor);

    assert.equal(
      Attribute.get(TinyDom.container(editor), 'dir'),
      'rtl',
      'RTL: the editor container should be marked as RTL'
    );

    const mainRadii = getRadii(main);
    const chevronRadii = getRadii(chevron);

    assertSquare('RTL action part', mainRadii.topLeft, 'left');
    assertRounded('RTL action part', mainRadii.topRight, 'right');
    assertRounded('RTL palette part', chevronRadii.topLeft, 'left');
    assertSquare('RTL palette part', chevronRadii.topRight, 'right');

    McEditor.remove(editor);
  });

  it('GH-81: The rounded corners of the colour split button mirror between LTR and RTL', async () => {
    const ltrEditor = await pCreateEditor('en');
    const ltrParts = await pGetSplitButtonParts(ltrEditor);
    const ltrMainRadii = getRadii(ltrParts.main);
    const ltrChevronRadii = getRadii(ltrParts.chevron);
    McEditor.remove(ltrEditor);

    const rtlEditor = await pCreateEditor('ar');
    const rtlParts = await pGetSplitButtonParts(rtlEditor);
    const rtlMainRadii = getRadii(rtlParts.main);
    const rtlChevronRadii = getRadii(rtlParts.chevron);
    McEditor.remove(rtlEditor);

    assertMirrored('action part', ltrMainRadii, rtlMainRadii);
    assertMirrored('palette part', ltrChevronRadii, rtlChevronRadii);
  });
});

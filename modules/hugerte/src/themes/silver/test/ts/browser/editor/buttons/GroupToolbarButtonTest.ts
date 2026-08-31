import { ApproxStructure, Assertions, Mouse, StructAssert, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Toolbar } from '@ephox/bridge';
import { Fun } from '@ephox/katamari';
import { Attribute, SugarBody } from '@ephox/sugar';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';
import { RawEditorOptions } from 'hugerte/core/api/OptionTypes';

import { extractOnlyOne } from '../../../module/UiUtils';

describe('browser.hugerte.themes.silver.editor.buttons.GroupToolbarButtonTest', () => {

  const defaultToolbarGroupOptions = {
    toolbar: 'formatting',
    toolbar_groups: {
      formatting: {
        icon: 'more-drawer',
        tooltip: 'Formatting',
        items: 'bold | italic'
      }
    }
  };

  const defaultToolbarGroupStruct = ApproxStructure.build((s, str, arr) => s.element('div', {
    classes: [ arr.has('tox-toolbar__overflow') ],
    children: [
      s.element('div', {
        classes: [ arr.has('tox-toolbar__group') ],
        children: [
          s.element('button', {
            attrs: { 'data-mce-name': str.is('bold') }
          })
        ]
      }),
      s.element('div', {
        classes: [ arr.has('tox-toolbar__group') ],
        children: [
          s.element('button', {
            attrs: { 'data-mce-name': str.is('italic') }
          })
        ]
      })
    ]
  }));

  const pTestWithEditor = async (options: RawEditorOptions, pDoTest: () => Promise<void>) => {
    const editor = await McEditor.pFromSettings<Editor>({
      theme: 'silver',
      base_url: '/project/hugerte/js/hugerte',
      toolbar_mode: 'floating',
      ...options
    });
    await UiFinder.pWaitForVisible('Waiting for menubar', SugarBody.body(), '.tox-menubar');
    await pDoTest();
    McEditor.remove(editor);
  };

  const testToolbarGroup = (options: RawEditorOptions, buttonSelector: string, toolbarSelector: string, expectedStruct: StructAssert) => () =>
    pTestWithEditor(options, async () => {
      Mouse.clickOn(SugarBody.body(), buttonSelector);
      await UiFinder.pWaitForVisible('Wait for toolbar to appear', SugarBody.body(), toolbarSelector);
      const toolbarGroup = extractOnlyOne(SugarBody.body(), toolbarSelector);
      Assertions.assertStructure(
        'Checking structure of the toolbar group',
        expectedStruct,
        toolbarGroup
      );
    });

  it('TINY-4229: Register floating group toolbar button via editor settings', testToolbarGroup(
    defaultToolbarGroupOptions,
    'button[data-mce-name="formatting"]',
    '.tox-toolbar__overflow',
    defaultToolbarGroupStruct
  ));

  it('TINY-4229: Register floating group toolbar button via editor API', testToolbarGroup(
    {
      toolbar: 'alignment',
      setup: (editor) => {
        editor.ui.registry.addGroupToolbarButton('alignment', {
          icon: 'align-left',
          tooltip: 'Alignment',
          items: [
            { name: 'Alignment', items: [ 'alignleft', 'aligncenter', 'alignright' ] }
          ]
        });
      }
    },
    'button[data-mce-name="alignment"]',
    '.tox-toolbar__overflow',
    ApproxStructure.build((s, str, arr) => s.element('div', {
      classes: [ arr.has('tox-toolbar__overflow') ],
      children: [
        s.element('div', {
          classes: [ arr.has('tox-toolbar__group') ],
          children: [
            s.element('button', {
              attrs: { 'data-mce-name': str.is('alignleft') }
            }),
            s.element('button', {
              attrs: { 'data-mce-name': str.is('aligncenter') }
            }),
            s.element('button', {
              attrs: { 'data-mce-name': str.is('alignright') }
            })
          ]
        })
      ]
    }))
  ));

  it('TINY-4616: Group toolbars are ignored when using wrap toolbar mode', () =>
    pTestWithEditor({
      ...defaultToolbarGroupOptions,
      toolbar: 'formatting | underline',
      toolbar_mode: 'wrap'
    }, () => {
      UiFinder.notExists(SugarBody.body(), 'button[data-mce-name="formatting"]');
      UiFinder.exists(SugarBody.body(), 'button[data-mce-name="underline"]');
      return Promise.resolve();
    })
  );

  it('TINY-9496: onSetup function should run when defining custom group toolbar button', () => {
    let hasSetupBeenCalled = false;
    pTestWithEditor({
      ...defaultToolbarGroupOptions,
      toolbar: 'test',
      setup: (editor: Editor) => {
        editor.ui.registry.addGroupToolbarButton('test', {
          text: 'test',
          items: 'alignleft aligncenter alignright',
          onSetup: () => {
            hasSetupBeenCalled = true;
            return Fun.noop;
          }
        });
      }
    }, () => {
      assert.isTrue(hasSetupBeenCalled);
      return Promise.resolve();
    });
  });

  it('GH-205: setTooltip should update the aria-label on a floating group toolbar button without a hover tooltip', () => {
    let groupButtonApi: Toolbar.ToolbarButtonInstanceApi | undefined;
    return pTestWithEditor({
      toolbar: 'alignment',
      setup: (editor: Editor) => {
        editor.ui.registry.addGroupToolbarButton('alignment', {
          icon: 'align-left',
          tooltip: 'Alignment',
          onSetup: (api) => {
            groupButtonApi = api;
            return Fun.noop;
          },
          items: [ { name: 'Alignment', items: [ 'alignleft', 'aligncenter', 'alignright' ] } ]
        });
      }
    }, async () => {
      assert.isOk(groupButtonApi);
      groupButtonApi?.setTooltip('Updated Alignment');
      const button = UiFinder.findIn(SugarBody.body(), 'button[data-mce-name="alignment"]').getOrDie();
      assert.equal(Attribute.get(button, 'aria-label'), 'Updated Alignment');
      // Group toolbar buttons only support the aria-label tooltip, so no hover tooltip should be shown
      Mouse.mouseOver(button);
      await Waiter.pWait(300);
      UiFinder.notExists(SugarBody.body(), '.tox-silver-sink .tox-tooltip__body');
    });
  });

});

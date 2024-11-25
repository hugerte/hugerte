import { ApproxStructure, Assertions, Waiter } from "@hugerte/agar";
import { GuiFactory, TestHelpers } from "@hugerte/alloy";
import { after, before, describe, it } from '@ephox/bedrock-client';
import { Cell, Fun, Global, Optional } from "@hugerte/katamari";
import { Class, SugarElement } from "@hugerte/sugar";

import Resource from 'hugerte/core/api/Resource';
import { HugeRTE } from 'hugerte/core/api/Hugerte';
import { renderCustomEditor } from 'hugerte/themes/silver/ui/dialog/CustomEditor';

import * as RepresentingUtils from '../../../module/RepresentingUtils';

declare const hugerte: HugeRTE;

describe('headless.hugerte.themes.silver.components.customeditor.BasicCustomEditorTest', () => {
  const resolveInit = Cell(false);
  const customEditorValue = Cell('zztop');

  let origTiny: HugeRTE | undefined;
  before(() => {
    origTiny = Global.hugerte;
    Global.hugerte = {
      Resource
    };

    hugerte.Resource.add('BasicCustomEditorTest', (e: HTMLElement) => new Promise((resolve) => {
      const intervalId = setInterval(() => {
        if (resolveInit.get()) {
          clearInterval(intervalId);
          Class.add(SugarElement.fromDom(e), 'my-custom-editor');
          resolve({
            setValue: (s: string) => customEditorValue.set(s),
            getValue: () => customEditorValue.get(),
            destroy: Fun.noop
          });
        }
      }, 100);
    }));
  });

  after(() => {
    Global.hugerte = origTiny;
    origTiny = undefined;
  });

  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderCustomEditor({
      type: 'customeditor',
      name: 'customeditor',
      tag: 'textarea',
      scriptId: 'BasicCustomEditorTest',
      scriptUrl: '/custom/404', // using the cache
      settings: undefined,
      onFocus: Optional.none()
    })
  ));

  it('Check basic structure', () => {
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, _str, arr) => s.element('div', {
        children: [
          s.element('textarea', {
            classes: [ arr.not('my-custom-editor') ]
          })
        ]
      })),
      hook.component().element
    );
  });

  it('Representing state', async () => {
    const component = hook.component();
    RepresentingUtils.assertRoundtrip(
      component,
      'foo'
    );

    // Set to initialised
    resolveInit.set(true);
    await Waiter.pTryUntil(
      'Waiting for CustomEditor init',
      () => Assertions.assertStructure(
        'Checking structure after init',
        ApproxStructure.build((s, _str, arr) => s.element('div', {
          children: [
            s.element('textarea', {
              classes: [ arr.has('my-custom-editor') ]
            })
          ]
        })),
        component.element
      )
    );

    RepresentingUtils.assertRoundtrip(
      component,
      'bar'
    );
  });
});

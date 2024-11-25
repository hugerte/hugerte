import { ApproxStructure, Assertions } from "@hugerte/agar";
import { GuiFactory, TestHelpers } from "@hugerte/alloy";
import { describe, it } from '@ephox/bedrock-client';
import { Fun } from "@hugerte/katamari";

import { UiFactoryBackstageShared } from 'hugerte/themes/silver/backstage/Backstage';
import { renderGrid } from 'hugerte/themes/silver/ui/dialog/Grid';

import TestProviders from '../../../module/TestProviders';

describe('headless.hugerte.themes.silver.components.grid.GridTest', () => {
  const sharedBackstage = {
    interpreter: Fun.identity as any,
    providers: TestProviders
  } as UiFactoryBackstageShared;

  const hook = TestHelpers.GuiSetup.bddSetup((_store, _doc, _body) => GuiFactory.build(
    renderGrid({
      columns: 10,
      items: [
        {
          dom: {
            tag: 'div',
            classes: [ 'foo' ]
          }
        } as any,
        {
          dom: {
            tag: 'div',
            classes: [ 'bar' ]
          }
        } as any
      ]
    }, sharedBackstage)
  ));

  it('Check basic structure', () => {
    Assertions.assertStructure(
      'Checking initial structure',
      ApproxStructure.build((s, _str, arr) => s.element('div', {
        classes: [ arr.has('tox-form__grid'), arr.has('tox-form__grid--10col') ],
        children: [
          s.element('div', {
            classes: [ arr.has('foo') ]
          }),
          s.element('div', {
            classes: [ arr.has('bar') ]
          })
        ]
      })),
      hook.component().element
    );
  });
});

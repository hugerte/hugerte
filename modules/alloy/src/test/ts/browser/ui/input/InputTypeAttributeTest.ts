import { ApproxStructure, Assertions, Step } from "@hugerte/agar";
import { UnitTest } from '@ephox/bedrock-client';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Input } from 'ephox/alloy/api/ui/Input';

UnitTest.asynctest('InputTypeAttributeTest', (success, failure) => {
  GuiSetup.setup((_store, _doc, _body) => GuiFactory.build(
    Input.sketch({
      inputAttributes: { type: 'number' }
    })
  ), (_doc, _body, _gui, component, _store) => {
    const testStructure = Step.sync(() => {
      Assertions.assertStructure(
        'Checking initial structure of input',
        ApproxStructure.build((s, str, _arr) => s.element('input', {
          attrs: {
            type: str.is('number')
          }
        })),
        component.element
      );
    });

    return [
      testStructure
    ];
  }, success, failure);
});

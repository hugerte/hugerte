import { ApproxStructure, Assertions } from "@hugerte/agar";
import { UnitTest } from '@ephox/bedrock-client';

import * as Behaviour from "hugerte/alloy/api/behaviour/Behaviour";
import { Tabstopping } from "hugerte/alloy/api/behaviour/Tabstopping";
import * as GuiFactory from "hugerte/alloy/api/component/GuiFactory";
import * as GuiSetup from "hugerte/alloy/api/testhelpers/GuiSetup";
import { Container } from "hugerte/alloy/api/ui/Container";

UnitTest.asynctest('TabstoppingTest', (success, failure) => {

  GuiSetup.setup((_store, _doc, _body) => GuiFactory.build(
    Container.sketch({
      containerBehaviours: Behaviour.derive([
        Tabstopping.config({ })
      ])
    })
  ), (_doc, _body, _gui, component, _store) => [
    Assertions.sAssertStructure(
      'Check initial tabstopping values',
      ApproxStructure.build((s, str, _arr) => s.element('div', {
        attrs: {
          'data-alloy-tabstop': str.is('true')
        }
      })),
      component.element
    )
  ], success, failure);
});

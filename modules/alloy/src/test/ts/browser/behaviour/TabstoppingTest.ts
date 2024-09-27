import { ApproxStructure, Assertions } from '@hugemce/agar';
import { UnitTest } from '@hugemce/bedrock-client';

import * as Behaviour from 'hugemce/alloy/api/behaviour/Behaviour';
import { Tabstopping } from 'hugemce/alloy/api/behaviour/Tabstopping';
import * as GuiFactory from 'hugemce/alloy/api/component/GuiFactory';
import * as GuiSetup from 'hugemce/alloy/api/testhelpers/GuiSetup';
import { Container } from 'hugemce/alloy/api/ui/Container';

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

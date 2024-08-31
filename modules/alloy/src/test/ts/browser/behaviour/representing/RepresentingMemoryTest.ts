import { UnitTest } from '@hugemce/bedrock-client';

import * as Behaviour from 'hugemce/alloy/api/behaviour/Behaviour';
import { Representing } from 'hugemce/alloy/api/behaviour/Representing';
import * as GuiFactory from 'hugemce/alloy/api/component/GuiFactory';
import * as GuiSetup from 'hugemce/alloy/api/testhelpers/GuiSetup';
import * as RepresentPipes from 'hugemce/alloy/test/behaviour/RepresentPipes';

UnitTest.asynctest('RepresentingTest (mode: memory)', (success, failure) => {
  GuiSetup.setup((_store, _doc, _body) => GuiFactory.build({
    dom: {
      tag: 'span'
    },
    behaviours: Behaviour.derive([
      Representing.config({
        store: {
          mode: 'memory',
          initialValue: '1'
        }
      })
    ])
  }), (_doc, _body, _gui, component, _store) => [
    RepresentPipes.sAssertValue('Checking initial value', '1', component),
    RepresentPipes.sSetValue(component, '2'),
    RepresentPipes.sAssertValue('Checking 2nd value', '2', component)
  ], success, failure);
});

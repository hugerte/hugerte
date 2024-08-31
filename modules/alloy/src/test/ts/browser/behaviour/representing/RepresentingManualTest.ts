import { UnitTest } from '@hugemce/bedrock-client';
import { Html } from '@hugemce/sugar';

import * as Behaviour from 'hugemce/alloy/api/behaviour/Behaviour';
import { Representing } from 'hugemce/alloy/api/behaviour/Representing';
import * as GuiFactory from 'hugemce/alloy/api/component/GuiFactory';
import * as GuiSetup from 'hugemce/alloy/api/testhelpers/GuiSetup';
import * as RepresentPipes from 'hugemce/alloy/test/behaviour/RepresentPipes';

UnitTest.asynctest('RepresentingTest (mode: manual)', (success, failure) => {
  GuiSetup.setup((store, _doc, _body) => GuiFactory.build({
    dom: {
      tag: 'span',
      innerHtml: 'stuff'
    },
    behaviours: Behaviour.derive([
      Representing.config({
        store: {
          mode: 'manual',
          getValue: (comp) => {
            store.adder('getValue')();
            return Html.get(comp.element);
          },
          setValue: (comp, v) => {
            Html.set(comp.element, v);
            store.adder('setValue(' + v + ')')();
          },
          initialValue: 'init-value'
        }
      })
    ])
  }), (_doc, _body, _gui, component, store) => [
    store.sAssertEq('Should have called setValue on init', [ 'setValue(init-value)' ]),
    RepresentPipes.sAssertValue('Checking initial value', 'init-value', component),
    store.sAssertEq('Should have called setValue on init', [ 'setValue(init-value)', 'getValue' ]),
    RepresentPipes.sSetValue(component, 'new-value'),
    store.sAssertEq('Should have called setValue on init', [ 'setValue(init-value)', 'getValue', 'setValue(new-value)' ]),
    RepresentPipes.sAssertValue('Checking 2nd value', 'new-value', component)
  ], success, failure);
});

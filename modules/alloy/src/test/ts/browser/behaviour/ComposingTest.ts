import { ApproxStructure, Assertions, Step } from '@hugemce/agar';
import { UnitTest } from '@hugemce/bedrock-client';

import * as Behaviour from 'hugemce/alloy/api/behaviour/Behaviour';
import { Composing } from 'hugemce/alloy/api/behaviour/Composing';
import * as GuiFactory from 'hugemce/alloy/api/component/GuiFactory';
import * as Memento from 'hugemce/alloy/api/component/Memento';
import * as GuiSetup from 'hugemce/alloy/api/testhelpers/GuiSetup';

UnitTest.asynctest('Browser Test: behaviour.ComposingTest', (success, failure) => {

  const inner = Memento.record({
    dom: { tag: 'span', innerHtml: 'inner' }
  });

  GuiSetup.setup(
    (_store, _doc, _body) => GuiFactory.build({
      dom: {
        tag: 'div'
      },
      components: [
        inner.asSpec()
      ],
      behaviours: Behaviour.derive([
        Composing.config({
          find: (comp) => {
            return inner.getOpt(comp);
          }
        })
      ])
    }),
    (_doc, _body, _gui, component, _store) => [
      Assertions.sAssertStructure(
        'Checking initial structure',
        ApproxStructure.build((s, str, _arr) => s.element('div', {
          children: [
            s.element('span', {
              html: str.is('inner')
            })
          ]
        })),
        component.element
      ),
      Step.sync(() => {
        const delegate = Composing.getCurrent(component).getOrDie('Could not find delegate');
        Assertions.assertStructure(
          'Checking delegate structure',
          ApproxStructure.build((s, str, _arr) => s.element('span', { html: str.is('inner') })),
          delegate.element
        );
      })
    ],
    success,
    failure
  );
});

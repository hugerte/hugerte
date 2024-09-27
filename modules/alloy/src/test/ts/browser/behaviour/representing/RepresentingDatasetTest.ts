import { ApproxStructure, Assertions, FocusTools, Step } from '@hugemce/agar';
import { UnitTest } from '@hugemce/bedrock-client';
import { Value } from '@hugemce/sugar';

import * as Behaviour from 'hugemce/alloy/api/behaviour/Behaviour';
import { Representing } from 'hugemce/alloy/api/behaviour/Representing';
import * as GuiFactory from 'hugemce/alloy/api/component/GuiFactory';
import * as GuiSetup from 'hugemce/alloy/api/testhelpers/GuiSetup';
import { Container } from 'hugemce/alloy/api/ui/Container';
import { DatasetRepresentingState } from 'hugemce/alloy/behaviour/representing/RepresentingTypes';
import { TypeaheadData } from 'hugemce/alloy/ui/types/TypeaheadTypes';

UnitTest.asynctest('RepresentingTest (mode: dataset)', (success, failure) => {
  GuiSetup.setup((_store, _doc, _body) => GuiFactory.build(
    Container.sketch({
      dom: {
        tag: 'input'
      },
      containerBehaviours: Behaviour.derive([
        Representing.config({
          store: {
            mode: 'dataset',
            initialValue: {
              value: 'dog',
              meta: {
                text: 'Hund'
              }
            },
            getDataKey: (component) => {
              return Value.get(component.element);
            },
            getFallbackEntry: (key) => {
              return { value: 'fallback.' + key.toLowerCase(), meta: { text: key }};
            },
            setValue: (comp, data) => {
              Value.set(comp.element, data.meta.text);
            }
          }
        })
      ])
    })
  ), (doc, _body, gui, component, _store) => {
    const sAssertRepValue = (label: string, expected: { value: string; meta: { text: string }}) => Step.sync(() => {
      const v = Representing.getValue(component);
      Assertions.assertEq(label, expected, v);
    });

    const sUpdateDataset = (newItems: TypeaheadData[]) => Step.sync(() => {
      const repState = Representing.getState(component) as DatasetRepresentingState;
      repState.update(newItems);
    });

    return [
      Assertions.sAssertStructure(
        'Initial value should be "Hund"',
        ApproxStructure.build((s, str, _arr) => s.element('input', {
          value: str.is('Hund')
        })),
        component.element
      ),

      sAssertRepValue('Checking represented value on load', { value: 'dog', meta: { text: 'Hund' }}),

      FocusTools.sSetFocus('Setting of focus on input field', gui.element, 'input'),
      FocusTools.sSetActiveValue(doc, 'Katze'),

      sAssertRepValue('Checking represented value after change', {
        value: 'fallback.katze',
        meta: {
          text: 'Katze'
        }
      }),

      FocusTools.sSetActiveValue(doc, 'Elephant'),

      sAssertRepValue('Checking represented value after set input but before update', {
        value: 'fallback.elephant',
        meta: {
          text: 'Elephant'
        }
      }),

      sUpdateDataset([
        { value: 'big.e', meta: { text: 'Elephant' }}
      ]),

      sAssertRepValue('Checking represented value after set input but after update', {
        value: 'big.e',
        meta: {
          text: 'Elephant'
        }
      }),
      Assertions.sAssertStructure(
        'Test will be Elephant."',
        ApproxStructure.build((s, str, _arr) => s.element('input', {
          value: str.is('Elephant')
        })),
        component.element
      )
    ];
  }, success, failure);
});

import { ApproxStructure, Assertions, Step } from "@hugerte/agar";
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Fun } from "@hugerte/katamari";
import { Attribute, SelectorFind } from "@hugerte/sugar";

import * as Behaviour from "hugerte/alloy/api/behaviour/Behaviour";
import { Replacing } from "hugerte/alloy/api/behaviour/Replacing";
import { Representing } from "hugerte/alloy/api/behaviour/Representing";
import * as GuiFactory from "hugerte/alloy/api/component/GuiFactory";
import { AlloySpec } from "hugerte/alloy/api/component/SpecTypes";
import * as GuiSetup from "hugerte/alloy/api/testhelpers/GuiSetup";
import { Container } from "hugerte/alloy/api/ui/Container";
import { DataField } from "hugerte/alloy/api/ui/DataField";
import { FormChooser } from "hugerte/alloy/api/ui/FormChooser";
import { FormCoupledInputs } from "hugerte/alloy/api/ui/FormCoupledInputs";
import { FormField } from "hugerte/alloy/api/ui/FormField";
import { HtmlSelect } from "hugerte/alloy/api/ui/HtmlSelect";
import { Input } from "hugerte/alloy/api/ui/Input";
import * as Tagger from "hugerte/alloy/registry/Tagger";
import * as RepresentPipes from "hugerte/alloy/test/behaviour/RepresentPipes";

UnitTest.asynctest('FieldsTest', (success, failure) => {

  const renderChoice = (choiceSpec: { value: string; text: string }): AlloySpec & { value: string } => ({
    value: choiceSpec.value,
    dom: {
      tag: 'span',
      innerHtml: choiceSpec.text,
      attributes: {
        'data-value': choiceSpec.value
      }
    },
    components: [ ]
  });

  const labelSpec: AlloySpec = {
    dom: {
      tag: 'label',
      innerHtml: 'Label'
    },
    components: [ ]
  };

  GuiSetup.setup((_store, _doc, _body) => {
    const inputA = FormField.sketch({
      uid: 'input-a',
      dom: {
        tag: 'div'
      },
      components: [
        FormField.parts.field({
          factory: Input,
          data: 'init'
        }),
        FormField.parts.label(labelSpec),
        FormField.parts['aria-descriptor']({
          text: 'help'
        })
      ]
    });

    const selectB = FormField.sketch({
      uid: 'select-b',
      dom: {
        tag: 'div'
      },
      components: [
        // TODO: Do not recalculate
        FormField.parts.label(labelSpec),
        FormField.parts.field({
          factory: HtmlSelect,
          options: [
            { value: 'select-b-init', text: 'Select-b-init' }
          ]
        })
      ]
    });

    const chooserC = FormChooser.sketch({
      uid: 'chooser-c',
      dom: {
        tag: 'div'
      },
      components: [
        FormChooser.parts.legend({ }),
        FormChooser.parts.choices({ })
      ],

      markers: {
        choiceClass: 'test-choice',
        selectedClass: 'test-selected-choice'
      },
      choices: Arr.map([
        { value: 'choice1', text: 'Choice1' },
        { value: 'choice2', text: 'Choice2' },
        { value: 'choice3', text: 'Choice3' }
      ], renderChoice)
    });

    const coupledDText = {
      dom: {
        tag: 'div'
      },
      components: [
        FormField.parts.label(labelSpec),
        FormField.parts.field({
          factory: Input
        })
      ]
    };

    const coupledD = FormCoupledInputs.sketch({
      dom: {
        tag: 'div',
        classes: [ 'coupled-group' ]
      },
      components: [
        FormCoupledInputs.parts.field1(coupledDText),
        FormCoupledInputs.parts.field2(coupledDText),
        FormCoupledInputs.parts.lock({
          dom: {
            tag: 'button',
            innerHtml: '+'
          }
        })
      ],

      onLockedChange: (current, other) => {
        Representing.setValueFrom(other, current);
      },
      markers: {
        lockClass: 'coupled-lock'
      }
    });

    const dataE = DataField.sketch({
      uid: 'data-e',
      dom: {
        tag: 'span'
      },
      getInitialValue: Fun.constant('data-e-init')
    });

    return GuiFactory.build(
      Container.sketch({
        components: [
          inputA,
          selectB,
          chooserC,
          coupledD,
          dataE
        ],

        containerBehaviours: Behaviour.derive([
          Replacing.config({ })
        ])
      })
    );

  }, (doc, _body, _gui, component, _store) => {

    const inputA = component.getSystem().getByUid('input-a').getOrDie();
    const selectB = component.getSystem().getByUid('select-b').getOrDie();
    const chooserC = component.getSystem().getByUid('chooser-c').getOrDie();
    const dataE = component.getSystem().getByUid('data-e').getOrDie();

    return [
      GuiSetup.mAddStyles(doc, [
        '.test-selected-choice, .coupled-lock { background: #cadbee }'
      ]),

      RepresentPipes.sAssertValue('Checking input-a value', 'init', inputA),

      Assertions.sAssertStructure('Check the input-a DOM', ApproxStructure.build((s, str, _arr) => {
        const input = SelectorFind.descendant(inputA.element, 'input').getOrDie('input element child was not found');
        const span = SelectorFind.descendant(inputA.element, 'span').getOrDie('span element child was not found');

        const inputID = Attribute.getOpt(input, 'id').getOrDie('Expected value for input.id');
        const spanID = Attribute.getOpt(span, 'id').getOrDie('Expected value for span.id');
        return s.element('div', {
          children: [
            s.element('input', {
              attrs: {
                'aria-describedby': str.is(spanID)
              }
            }),
            s.element('label', {
              attrs: {
                for: str.is(inputID)
              }
            }),
            s.element('span', { })
          ]
        });
      }), inputA.element),

      Assertions.sAssertStructure('Check the select-b dom', ApproxStructure.build((s, _str, _arr) => s.element('div', {
        children: [
          s.element('label', { }),
          s.element('select', { })
        ]
      })), selectB.element),

      Assertions.sAssertStructure('Check the chooser-c dom', ApproxStructure.build((s, str, _arr) => s.element('div', {
        children: [
          s.element('legend', { }),
          s.element('span', { attrs: { role: str.is('radio') }}),
          s.element('span', { attrs: { role: str.is('radio') }}),
          s.element('span', { attrs: { role: str.is('radio') }})
        ]
      })), chooserC.element),

      RepresentPipes.sAssertValue('Checking select-b value', 'select-b-init', selectB),

      Step.sync(() => {
        const val = Representing.getValue(chooserC).getOrDie();
        Assertions.assertEq('Checking chooser-c value', 'choice1', val);

        Representing.setValue(chooserC, 'choice3');
        const val2 = Representing.getValue(chooserC).getOrDie();
        Assertions.assertEq('Checking chooser-c value after set', 'choice3', val2);
      }),

      Assertions.sAssertStructure('Checking the data field (E)', ApproxStructure.build((s, _str, _arr) => s.element('span', { children: [ ] })), dataE.element),

      Step.sync(() => {
        const val = Representing.getValue(dataE);
        Assertions.assertEq('Checking data-e value', 'data-e-init', val);

        Representing.setValue(dataE, 'data-e-new');
        Assertions.assertEq('Checking data-e value after set', 'data-e-new', Representing.getValue(dataE));

        // Remove it from the container
        Replacing.remove(component, dataE);

        // Add it back the the container
        Replacing.append(component, GuiFactory.premade(dataE));
        Assertions.assertEq('Checking data-e value was reset when added back to DOM', 'data-e-init', Representing.getValue(dataE));
      }),

      Step.sync(() => {
        FormField.getField(inputA).fold(() => {
          throw new Error('The input Field could not be found');
        }, (comp) => {
          const alloyId = Tagger.readOrDie(comp.element);
          Assertions.assertEq('FormField should have an api that returns the input field', 'input-a-field', alloyId);
        });

        FormField.getLabel(inputA).fold(() => {
          throw new Error('The input Label could not be found');
        }, (comp) => {
          const alloyId = Tagger.readOrDie(comp.element);
          Assertions.assertEq('FormField should have an api that returns the input Label', 'input-a-label', alloyId);
        });
      }),

      GuiSetup.mRemoveStyles
    ];
  }, success, failure);
});

import { ApproxStructure, Assertions, FocusTools, Guard, Step } from "@hugerte/agar";
import { UnitTest } from '@ephox/bedrock-client';

import * as Behaviour from "hugerte/alloy/api/behaviour/Behaviour";
import { Focusing } from "hugerte/alloy/api/behaviour/Focusing";
import * as GuiFactory from "hugerte/alloy/api/component/GuiFactory";
import * as GuiSetup from "hugerte/alloy/api/testhelpers/GuiSetup";
import { Container } from "hugerte/alloy/api/ui/Container";

UnitTest.asynctest('FocusingTest', (success, failure) => {

  GuiSetup.setup((store, _doc, _body) => GuiFactory.build(
    Container.sketch({
      dom: {
        classes: [ 'focusable' ],
        styles: {
          width: '100px',
          height: '100px',
          background: 'blue'
        }
      },
      containerBehaviours: Behaviour.derive([
        Focusing.config({
          onFocus: store.adder('onFocus')
        })
      ])
    })
  ), (doc, _body, gui, component, _store) => [
    Assertions.sAssertStructure(
      'Checking tabindex is -1',
      ApproxStructure.build((s, str, _arr) => s.element('div', {
        attrs: {
          tabindex: str.is('-1')
        }
      })),
      component.element
    ),

    Step.control(
      FocusTools.sIsOnSelector('Should not start with focus', doc, '.focusable'),
      // NOTE: this required a change to agar because it was throwing an error prototype,
      // rather than die for its assertion, which meant that the tryUntilNot did not work.
      // I had to hack the local agar to ignore the error prototype check in Guard. Will
      // need to fix this.
      Guard.tryUntilNot('Container should not be focused originally')
    ),
    Step.sync(() => {
      component.getSystem().triggerFocus(component.element, gui.element);
    }),
    FocusTools.sTryOnSelector('Focusing after focus call', doc, '.focusable')

  ], success, failure);
});

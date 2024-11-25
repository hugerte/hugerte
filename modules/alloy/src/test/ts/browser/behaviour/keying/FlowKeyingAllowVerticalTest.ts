import { FocusTools, Keyboard, Keys } from "@hugerte/agar";
import { UnitTest } from '@ephox/bedrock-client';

import * as Behaviour from "hugerte/alloy/api/behaviour/Behaviour";
import { Focusing } from "hugerte/alloy/api/behaviour/Focusing";
import { Keying } from "hugerte/alloy/api/behaviour/Keying";
import * as GuiFactory from "hugerte/alloy/api/component/GuiFactory";
import * as AlloyEvents from "hugerte/alloy/api/events/AlloyEvents";
import * as GuiSetup from "hugerte/alloy/api/testhelpers/GuiSetup";
import { Container } from "hugerte/alloy/api/ui/Container";
import * as NavigationUtils from "hugerte/alloy/test/NavigationUtils";

UnitTest.asynctest('Flow Keying Allow Vertical Test', (success, failure) => {

  GuiSetup.setup((store, _doc, _body) => {
    const item = (classes: string[], name: string) => Container.sketch({
      dom: {
        tag: 'span',
        styles: {
          display: 'inline-block',
          width: '20px',
          height: '20px',
          margin: '2px',
          border: '1px solid blue'
        },
        classes
      },
      events: AlloyEvents.derive([
        AlloyEvents.runOnExecute(
          store.adder('item.execute: ' + name)
        )
      ]),
      containerBehaviours: Behaviour.derive([
        Focusing.config({ })
      ])
    });

    return GuiFactory.build(
      Container.sketch({
        dom: {
          classes: [ 'flow-keying-test' ],
          styles: {
            background: 'white',
            width: '200px',
            height: '200px'
          }
        },
        uid: 'custom-uid',
        containerBehaviours: Behaviour.derive([
          Keying.config({
            mode: 'flow',
            selector: '.stay',
            allowVertical: false
          })
        ]),
        components: [
          item([ 'stay', 'one' ], 'one'),
          item([ 'stay', 'two' ], 'two'),
          item([ 'stay', 'three' ], 'three'),
          item([ 'stay', 'four' ], 'four'),
          item([ 'stay', 'five' ], 'five')
        ]
      })
    );
  }, (doc, body, gui, _component, store) => {

    const targets = {
      one: { label: 'one', selector: '.one' },
      two: { label: 'two', selector: '.two' },
      three: { label: 'three', selector: '.three' },
      four: { label: 'four', selector: '.four' },
      five: { label: 'five', selector: '.five' }
    };

    return [
      GuiSetup.mSetupKeyLogger(body),
      FocusTools.sSetFocus('Initial focus', gui.element, '.one'),
      NavigationUtils.sequence(
        doc,
        Keys.right(),
        {},
        [
          targets.two,
          targets.three,
          targets.four,
          targets.five,
          targets.one,
          targets.two
        ]
      ),
      NavigationUtils.sequence(
        doc,
        Keys.up(),
        { },
        [
          targets.two,
          targets.two,
          targets.two,
          targets.two
        ]
      ),
      NavigationUtils.sequence(
        doc,
        Keys.left(),
        { },
        [
          targets.one,
          targets.five,
          targets.four,
          targets.three
        ]
      ),
      NavigationUtils.sequence(
        doc,
        Keys.down(),
        { },
        [
          targets.three,
          targets.three,
          targets.three
        ]
      ),

      // Test execute
      Keyboard.sKeydown(doc, Keys.enter(), {}),
      store.sAssertEq('Check that execute has fired on the right target', [ 'item.execute: three' ]),
      GuiSetup.mTeardownKeyLogger(body, [
        // 4x Keyup, ignored by alloy on Keys.up()
        'keydown.to.body: 38',
        'keydown.to.body: 38',
        'keydown.to.body: 38',
        'keydown.to.body: 38',
        // 3x Keydown, ignored by alloy on Keys.down()
        'keydown.to.body: 40',
        'keydown.to.body: 40',
        'keydown.to.body: 40'
      ])
    ];
  }, success, failure);
});

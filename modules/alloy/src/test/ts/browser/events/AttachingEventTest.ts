import { Pipeline, Step, TestStore } from '@hugemce/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Attribute, SugarBody, SugarNode, Traverse } from '@hugemce/sugar';

import * as EventRoot from 'hugemce/alloy/alien/EventRoot';
import * as GuiFactory from 'hugemce/alloy/api/component/GuiFactory';
import * as AlloyEvents from 'hugemce/alloy/api/events/AlloyEvents';
import * as SystemEvents from 'hugemce/alloy/api/events/SystemEvents';
import * as Attachment from 'hugemce/alloy/api/system/Attachment';
import * as Gui from 'hugemce/alloy/api/system/Gui';
import { Container } from 'hugemce/alloy/api/ui/Container';

UnitTest.asynctest('Browser Test: events.AttachingEventTest', (success, failure) => {

  const gui = Gui.takeover(
    GuiFactory.build(
      Container.sketch({
        dom: {
          classes: [ 'outer-container' ]
        }
      })
    )
  );

  const store = TestStore();

  const wrapper = GuiFactory.build({
    dom: {
      tag: 'div',
      classes: [ 'main-container' ],
      styles: {
        width: '100px',
        height: '100px'
      }
    },
    components: [
      Container.sketch({
        events: AlloyEvents.derive([
          AlloyEvents.runOnAttached((comp, simulatedEvent) => {
            simulatedEvent.stop();
            const parent = Traverse.parent(comp.element).filter(SugarNode.isElement).getOrDie(
              'At attachedToDom, a DOM parent must exist'
            );
            store.adder('attached-to:' + Attribute.get(parent, 'class'))();
          }),

          AlloyEvents.runOnDetached((comp, simulatedEvent) => {
            simulatedEvent.stop();
            const parent = Traverse.parent(comp.element).filter(SugarNode.isElement).getOrDie(
              'At detachedFromDom, a DOM parent must exist'
            );
            store.adder('detached-from:' + Attribute.get(parent, 'class'))();
          }),

          AlloyEvents.run(SystemEvents.systemInit(), (comp, simulatedEvent) => {
            if (EventRoot.isSource(comp, simulatedEvent)) {
              simulatedEvent.stop();
              store.adder('init')();
            }
          })
        ])
      })
    ]
  });

  Pipeline.async({}, [
    Step.sync(() => {
      Assert.eq(
        'Checking that the component has no size',
        0,
        wrapper.element.dom.getBoundingClientRect().width
      );
    }),

    store.sAssertEq('Nothing has fired yet', [ ]),

    Step.sync(() => {
      gui.add(wrapper);
      store.assertEq('After adding to system, init should have fired', [ 'init' ]);
    }),

    Step.wait(500),

    Step.sync(() => {
      Assert.eq(
        'Even though added to system, not added to DOM yet so still size 0',
        0,
        wrapper.element.dom.getBoundingClientRect().width
      );
    }),
    store.sAssertEq('After adding to system and waiting, still only init should have fired', [ 'init' ]),
    store.sClear,

    Step.sync(() => {
      Attachment.attachSystem(SugarBody.body(), gui);
    }),

    Step.sync(() => {
      Assert.eq(
        'Now added to the DOM, so should have size 100',
        100,
        wrapper.element.dom.getBoundingClientRect().width
      );
    }),

    store.sAssertEq('After adding to the DOM, should have fired attached', [ 'attached-to:main-container' ]),
    store.sClear,

    Step.sync(() => {
      Attachment.detachSystem(gui);
    }),

    store.sAssertEq('After detaching from the DOM, should have fired detached', [ 'detached-from:main-container' ])
  ], success, failure);
});

import { Step } from "@hugerte/agar";
import { UnitTest } from '@ephox/bedrock-client';
import { FieldSchema, StructureSchema } from "@hugerte/boulder";

import * as Behaviour from "hugerte/alloy/api/behaviour/Behaviour";
import { Keying } from "hugerte/alloy/api/behaviour/Keying";
import { Receiving } from "hugerte/alloy/api/behaviour/Receiving";
import * as GuiFactory from "hugerte/alloy/api/component/GuiFactory";
import * as GuiSetup from "hugerte/alloy/api/testhelpers/GuiSetup";
import { Container } from "hugerte/alloy/api/ui/Container";

UnitTest.asynctest('ReceivingTest', (success, failure) => {

  GuiSetup.setup((store, _doc, _body) => GuiFactory.build(
    Container.sketch({
      dom: {
        classes: [ 'receiving-test' ]
      },
      uid: 'custom-uid',
      containerBehaviours: Behaviour.derive([
        Keying.config({
          mode: 'execution'
        }),
        Receiving.config({
          channels: {
            'test.channel.1': {
              schema: StructureSchema.objOfOnly([
                FieldSchema.required('dummy')
              ]),
              onReceive: (_component, data) => {
                store.adder('received: ' + data.dummy)();
              }
            }
          }
        })
      ]),
      components: [

      ]
    })
  ), (_doc, _body, gui, _component, store) => [
    store.sAssertEq('No messages yet', [ ]),
    Step.sync(() => {
      gui.broadcastOn([ 'test.channel.1' ], {
        dummy: '1'
      });
    }),
    store.sAssertEq('After broadcast to channel', [ 'received: 1' ]),
    store.sClear,
    Step.sync(() => {
      gui.broadcast({ dummy: '2' });
    }),
    store.sAssertEq('After broadcast to all', [ 'received: 2' ])
  ], success, failure);
});

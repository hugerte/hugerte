import { Class, SugarElement } from "@hugerte/sugar";

import * as Behaviour from "hugerte/alloy/api/behaviour/Behaviour";
import { Replacing } from "hugerte/alloy/api/behaviour/Replacing";
import * as GuiFactory from "hugerte/alloy/api/component/GuiFactory";
import * as AlloyEvents from "hugerte/alloy/api/events/AlloyEvents";
import * as Attachment from "hugerte/alloy/api/system/Attachment";
import * as Gui from "hugerte/alloy/api/system/Gui";
import { Container } from "hugerte/alloy/api/ui/Container";
import * as HtmlDisplay from "hugerte/alloy/demo/HtmlDisplay";

export default (): void => {
  const gui = Gui.create();
  const body = SugarElement.fromDom(document.body);
  Class.add(gui.element, 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  const list = HtmlDisplay.section(
    gui,
    'This list will change after three seconds (when the square is added to the page)',
    Container.sketch({
      dom: {
        tag: 'ol'
      },
      components: [
        {
          dom: {
            tag: 'li',
            innerHtml: 'The square is an in-memory component not connected to the system'
          }
        }
      ],

      containerBehaviours: Behaviour.derive([
        Replacing.config({ })
      ])
    })
  );

  const square = GuiFactory.build({
    dom: {
      tag: 'div',
      styles: {
        position: 'absolute',
        width: '20px',
        height: '20px',
        background: 'black'
      }
    },

    events: AlloyEvents.derive([
      AlloyEvents.runOnAttached((sq, simulatedEvent) => {
        simulatedEvent.stop();
        Replacing.append(list, {
          dom: {
            tag: 'li',
            innerHtml: 'The square has been attached to the DOM: ' + new Date().getSeconds()
          }
        });
      }),

      AlloyEvents.runOnInit((sq, simulatedEvent) => {
        simulatedEvent.stop();
        Replacing.append(list, {
          dom: {
            tag: 'li',
            innerHtml: 'The square has been added to the system: ' + new Date().getSeconds()
          }
        });
      })
    ])
  });

  setTimeout(() => {
    list.getSystem().addToWorld(square);
    setTimeout(() => {
      gui.add(square);
    }, 2000);
  }, 2000);

};

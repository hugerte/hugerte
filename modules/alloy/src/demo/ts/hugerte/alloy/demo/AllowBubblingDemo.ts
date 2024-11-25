import { Arr } from "@hugerte/katamari";
import { SugarElement } from "@hugerte/sugar";

import * as AddEventsBehaviour from "hugerte/alloy/api/behaviour/AddEventsBehaviour";
import { AllowBubbling } from "hugerte/alloy/api/behaviour/AllowBubbling";
import * as Behaviour from "hugerte/alloy/api/behaviour/Behaviour";
import { AlloySpec } from "hugerte/alloy/api/component/SpecTypes";
import * as AlloyEvents from "hugerte/alloy/api/events/AlloyEvents";
import * as Attachment from "hugerte/alloy/api/system/Attachment";
import * as Gui from "hugerte/alloy/api/system/Gui";
import { Container } from "hugerte/alloy/api/ui/Container";
import * as HtmlDisplay from "hugerte/alloy/demo/HtmlDisplay";

const getItemSpec = (): AlloySpec => ({
  dom: {
    tag: 'div',
    classes: [ 'item' ]
  }
});

export default (): void => {
  const gui = Gui.create();
  const body = SugarElement.fromDom(document.body);
  Attachment.attachSystem(body, gui);

  HtmlDisplay.section(
    gui,
    'Allow Bubbling',
    Container.sketch({
      dom: {
        tag: 'div',
        styles: {
          margin: '10px 10px 20px 10px',
          height: '300px',
          border: '1px solid black',
          overflow: 'scroll'
        }
      },
      components: Arr.range(15, getItemSpec),
      containerBehaviours: Behaviour.derive([
        AllowBubbling.config({
          events: [{
            native: 'scroll',
            simulated: 'bubbled.scroll'
          }]
        }),
        AddEventsBehaviour.config('events', [
          AlloyEvents.run('bubbled.scroll', (comp, e) => {
            // eslint-disable-next-line no-console
            console.log(e.event.raw);
          })
        ])
      ])
    })
  );
};

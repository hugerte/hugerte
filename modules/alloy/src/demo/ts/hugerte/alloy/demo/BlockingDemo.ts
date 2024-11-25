import { Result } from "@hugerte/katamari";
import { SugarBody, Traverse } from "@hugerte/sugar";

import * as Behaviour from "hugerte/alloy/api/behaviour/Behaviour";
import { Blocking } from "hugerte/alloy/api/behaviour/Blocking";
import { Replacing } from "hugerte/alloy/api/behaviour/Replacing";
import * as DomFactory from "hugerte/alloy/api/component/DomFactory";
import * as AlloyEvents from "hugerte/alloy/api/events/AlloyEvents";
import * as NativeEvents from "hugerte/alloy/api/events/NativeEvents";
import * as Attachment from "hugerte/alloy/api/system/Attachment";
import * as Gui from "hugerte/alloy/api/system/Gui";
import { Container } from "hugerte/alloy/api/ui/Container";
import * as HtmlDisplay from "hugerte/alloy/demo/HtmlDisplay";

export default (): void => {
  const gui = Gui.create();
  const body = SugarBody.body();
  Attachment.attachSystem(body, gui);

  // Used below in specs
  const spinnerDom = {
    tag: 'div',
    classes: [ 'tox-dialog__busy-spinner' ],
    attributes: {
      'aria-label': 'It blocked yo'
    },
    styles: {
      left: '0px',
      right: '0px',
      bottom: '0px',
      top: '0px',
      position: 'absolute'
    }
  };

  HtmlDisplay.section(
    gui,
    'Blocking',
    Container.sketch({
      dom: {
        tag: 'div',
        innerHtml: 'This is the text'
      },
      components: [
        {
          dom: {
            tag: 'button',
            innerHtml: 'Block'
          },
          events: AlloyEvents.derive([
            AlloyEvents.run(NativeEvents.click(), (comp) => {
              const parent = Traverse.parent(comp.element);
              const parentComp = parent.bind((parent) => comp.getSystem().getByDom(parent).toOptional());
              parentComp.each((parent) => {
                Blocking.block(parent, (_comp, bs) => ({
                  dom: spinnerDom,
                  behaviours: bs,
                  components: [{
                    dom: DomFactory.fromHtml('<div class="tox-spinner"><div></div><div></div><div></div></div>')
                  }]
                }));
              });
            })
          ])
        },
        {
          dom: {
            tag: 'button',
            innerHtml: 'Unblock'
          },
          events: AlloyEvents.derive([
            AlloyEvents.run(NativeEvents.click(), (comp) => {
              const parent = Result.fromOption(Traverse.parent(comp.element), new Error('No parent'));
              const parentComp = parent.bind((parent) => comp.getSystem().getByDom(parent));
              parentComp.each((parent) => {
                setTimeout(() => Blocking.unblock(parent), 2000);
              });
            })
          ])
        }
      ],
      containerBehaviours: Behaviour.derive([
        Replacing.config({ }),
        Blocking.config({ })
      ])
    })
  );
};

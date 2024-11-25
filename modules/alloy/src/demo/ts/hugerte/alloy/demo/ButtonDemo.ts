import { Class, SugarElement } from "@hugerte/sugar";

import * as Behaviour from "hugerte/alloy/api/behaviour/Behaviour";
import { Toggling } from "hugerte/alloy/api/behaviour/Toggling";
import * as Attachment from "hugerte/alloy/api/system/Attachment";
import * as Gui from "hugerte/alloy/api/system/Gui";
import { Button } from "hugerte/alloy/api/ui/Button";
import * as HtmlDisplay from "hugerte/alloy/demo/HtmlDisplay";
import * as DomModification from "hugerte/alloy/dom/DomModification";

/* eslint-disable no-console */

export default (): void => {
  const gui = Gui.create();
  const body = SugarElement.fromDom(document.body);
  Class.add(gui.element, 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  const redBehaviour = Behaviour.create({
    fields: [ ],
    name: 'red.behaviour',
    active: {
      exhibit: () => {
        return DomModification.nu({
          classes: [ 'cat' ],
          attributes: {

          },
          styles: {
            color: 'red'
          }
        });
      }
    }
  });

  const catBehaviour = Behaviour.create({
    fields: [ ],
    name: 'cat.behaviour',
    active: {
      exhibit: () => {
        return DomModification.nu({
          classes: [ 'cat' ],
          attributes: {
            'data-cat': 'cat'
          },
          styles: {
            background: 'blue'
          }
        });
      }
    }
  });

  HtmlDisplay.section(
    gui,
    'This button is a <code>button</code> tag with an image',
    Button.sketch({
      dom: {
        tag: 'button',
        styles: {
          'background-color': 'black',
          'background-image': 'url(http://yamaha/textbox/icons/Transforms13.png)',
          'width': '20px',
          'height': '20px'
        }
      },
      action: () => {
        console.log('*** Image ButtonDemo click ***');
      }
    })
  );

  const button2 = HtmlDisplay.section(
    gui,
    'This toggle button is a <code>span</code> tag with an font',
    Button.sketch({
      dom: {
        tag: 'button',
        classes: [ 'demo-alloy-bold' ],
        styles: {
          border: '1px solid #ccc',
          display: 'inline-block'
        }
      },
      action: () => {
        console.log('*** Font ButtonDemo click ***');
      },
      buttonBehaviours: Behaviour.derive([
        Toggling.config({
          toggleClass: 'demo-selected',
          aria: {
            mode: 'pressed'
          }
        })
      ])
    })
  );

  Toggling.on(button2);

  HtmlDisplay.section(
    gui,
    'This text button has two custom behaviours. One adds (among other things) "data-cat" and ' +
    'background blue, and the other adds color red',
    Button.sketch({
      dom: {
        tag: 'span',
        innerHtml: 'Button.with.Text'
      },
      action: () => {
        console.log('*** ButtonDemo click ***');
      },

      buttonBehaviours: Behaviour.derive([
        catBehaviour.config({ }),
        redBehaviour.config({ })
      ])
    })
  );
};

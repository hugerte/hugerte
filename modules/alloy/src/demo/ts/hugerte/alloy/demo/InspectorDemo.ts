import { SugarBody } from "@hugerte/sugar";

import * as GuiFactory from "hugerte/alloy/api/component/GuiFactory";
import * as Attachment from "hugerte/alloy/api/system/Attachment";
import * as Gui from "hugerte/alloy/api/system/Gui";
import { Button } from "hugerte/alloy/api/ui/Button";
import { Form } from "hugerte/alloy/api/ui/Form";
import { Input } from "hugerte/alloy/api/ui/Input";
import * as Debugging from "hugerte/alloy/debugging/Debugging";
import * as HtmlDisplay from "hugerte/alloy/demo/HtmlDisplay";
import { FormParts } from "hugerte/alloy/ui/types/FormTypes";

/* eslint-disable no-console */

export default (): void => {
  const gui = Gui.create();

  const body = SugarBody.body();
  Attachment.attachSystem(body, gui);

  Debugging.registerInspector('inspector-demo', gui);

  HtmlDisplay.section(gui,
    '<p>Inspect away! "Alloy" will appear in the elements panel in Chrome Developer Tools</p>' +
    '<p>Note, the inspector is not publically available yet.</p>',
    {
      dom: {
        tag: 'div'
      },
      components: [
        GuiFactory.text('This is just some text'),
        Button.sketch({
          dom: {
            tag: 'button',
            innerHtml: 'Button'
          },
          action: () => {
            console.log('clicked on a button');
          }
        }),
        Form.sketch((parts: FormParts) => ({
          dom: {
            tag: 'div'
          },
          components: [
            parts.field('alpha', Input.sketch({ }))
          ]
        }))
      ]
    }
  );
};

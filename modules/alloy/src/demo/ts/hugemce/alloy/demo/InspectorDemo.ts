import { SugarBody } from '@hugemce/sugar';

import * as GuiFactory from 'hugemce/alloy/api/component/GuiFactory';
import * as Attachment from 'hugemce/alloy/api/system/Attachment';
import * as Gui from 'hugemce/alloy/api/system/Gui';
import { Button } from 'hugemce/alloy/api/ui/Button';
import { Form } from 'hugemce/alloy/api/ui/Form';
import { Input } from 'hugemce/alloy/api/ui/Input';
import * as Debugging from 'hugemce/alloy/debugging/Debugging';
import * as HtmlDisplay from 'hugemce/alloy/demo/HtmlDisplay';
import { FormParts } from 'hugemce/alloy/ui/types/FormTypes';

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

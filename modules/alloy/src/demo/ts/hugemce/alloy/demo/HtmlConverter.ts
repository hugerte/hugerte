import { SelectorFind } from '@hugemce/sugar';

import * as Behaviour from 'hugemce/alloy/api/behaviour/Behaviour';
import { Replacing } from 'hugemce/alloy/api/behaviour/Replacing';
import { Representing } from 'hugemce/alloy/api/behaviour/Representing';
import * as GuiFactory from 'hugemce/alloy/api/component/GuiFactory';
import * as GuiTemplate from 'hugemce/alloy/api/component/GuiTemplate';
import * as Attachment from 'hugemce/alloy/api/system/Attachment';
import * as Gui from 'hugemce/alloy/api/system/Gui';
import { Button } from 'hugemce/alloy/api/ui/Button';
import { Container } from 'hugemce/alloy/api/ui/Container';
import { Input } from 'hugemce/alloy/api/ui/Input';

export default (): void => {
  const hugemceUi = SelectorFind.first('#hugemce-ui').getOrDie();

  // TODO: Change this to match the simplified UI templating model we have now including text

  const page = Container.sketch({
    components: [
      Container.sketch({
        dom: {
          tag: 'p',
          innerHtml: 'Copy your HTML structure into this textarea and press <strong>Convert</strong>'
        }
      }),
      Input.sketch({
        tag: 'textarea',
        inputStyles: {
          width: '90%',
          height: '300px',
          display: 'block'
        },
        data: '<div class="cat dog elephant" data-hugemce="this is"><div id="mike">chau</div></div>',
        uid: 'textarea-input'
      }),
      Button.sketch({
        dom: {
          tag: 'button',
          innerHtml: 'Convert'
        },
        action: (button) => {
          const textarea = button.getSystem().getByUid('textarea-input').getOrDie();
          const value = Representing.getValue(textarea);
          const output = GuiTemplate.readHtml(value).getOrDie();
          const display = button.getSystem().getByUid('pre-output').getOrDie();
          const prettyprint = JSON.stringify(output, undefined, 2);

          Replacing.set(display, [ GuiFactory.text(prettyprint) ]);
        }
      }),

      Container.sketch({
        uid: 'pre-output',
        dom: {
          tag: 'pre'
        },
        containerBehaviours: Behaviour.derive([
          Replacing.config({ })
        ])
      })
    ]
  });

  const root = GuiFactory.build(page);
  const gui = Gui.takeover(root);

  Attachment.attachSystem(hugemceUi, gui);

};

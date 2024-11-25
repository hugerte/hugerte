import { SelectorFind } from "@hugerte/sugar";

import * as Behaviour from "hugerte/alloy/api/behaviour/Behaviour";
import { Replacing } from "hugerte/alloy/api/behaviour/Replacing";
import { Representing } from "hugerte/alloy/api/behaviour/Representing";
import * as GuiFactory from "hugerte/alloy/api/component/GuiFactory";
import * as GuiTemplate from "hugerte/alloy/api/component/GuiTemplate";
import * as Attachment from "hugerte/alloy/api/system/Attachment";
import * as Gui from "hugerte/alloy/api/system/Gui";
import { Button } from "hugerte/alloy/api/ui/Button";
import { Container } from "hugerte/alloy/api/ui/Container";
import { Input } from "hugerte/alloy/api/ui/Input";

export default (): void => {
  const ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

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
        data: '<div class="cat dog elephant" data-ephox="this is"><div id="mike">chau</div></div>',
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

  Attachment.attachSystem(ephoxUi, gui);

};

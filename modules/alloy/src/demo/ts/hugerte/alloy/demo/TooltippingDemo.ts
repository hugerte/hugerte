import { Arr, Result } from "@hugerte/katamari";
import { Class, SugarElement } from "@hugerte/sugar";

import * as Behaviour from "hugerte/alloy/api/behaviour/Behaviour";
import { Focusing } from "hugerte/alloy/api/behaviour/Focusing";
import { Keying } from "hugerte/alloy/api/behaviour/Keying";
import { Positioning } from "hugerte/alloy/api/behaviour/Positioning";
import { Tooltipping } from "hugerte/alloy/api/behaviour/Tooltipping";
import * as GuiFactory from "hugerte/alloy/api/component/GuiFactory";
import { AlloySpec } from "hugerte/alloy/api/component/SpecTypes";
import * as Attachment from "hugerte/alloy/api/system/Attachment";
import * as Gui from "hugerte/alloy/api/system/Gui";
import { Container } from "hugerte/alloy/api/ui/Container";
import * as HtmlDisplay from "hugerte/alloy/demo/HtmlDisplay";

export default (): void => {
  const gui = Gui.create();
  const body = SugarElement.fromDom(document.body);
  Class.add(gui.element, 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  const sink = GuiFactory.build({
    dom: {
      tag: 'div'
    },
    behaviours: Behaviour.derive([
      Positioning.config({ })
    ])
  });

  const lazySink = () => {
    return Result.value(sink);
  };
  gui.add(sink);

  HtmlDisplay.section(
    gui,
    'This is a container of three buttons with tooltips',
    Container.sketch({
      dom: {
        tag: 'div'
      },
      containerBehaviours: Behaviour.derive([
        Focusing.config({ }),
        Keying.config({
          mode: 'flow',
          selector: 'button'
        })
      ]),

      components: Arr.map([ 'alpha', 'beta', 'gamma' ], (n): AlloySpec => {
        return {
          dom: {
            tag: 'button',
            innerHtml: n
          },
          behaviours: Behaviour.derive([
            Focusing.config({ }),
            Tooltipping.config({
              lazySink,
              // NOTE: At this stage, exclusive=false, probably doesn't do much, because
              // a mouseout/focusout is almost always fired before another tooltip
              // would show. However, if there was an API to make tooltips show,
              // then it would have a purpose.
              exclusive: true,
              tooltipDom: {
                tag: 'span',
                styles: {
                  background: 'black',
                  color: 'white',
                  padding: '10px'
                },
                innerHtml: 'Tooltip: ' + n
              }
            })
          ])
        };
      }).concat([
        GuiFactory.premade(sink)
      ])
    })
  );
};

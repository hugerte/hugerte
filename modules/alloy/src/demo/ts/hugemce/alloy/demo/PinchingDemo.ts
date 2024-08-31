import { Css, Height, SelectorFind, SugarElement, Width } from '@hugemce/sugar';

import * as Behaviour from 'hugemce/alloy/api/behaviour/Behaviour';
import { Pinching } from 'hugemce/alloy/api/behaviour/Pinching';
import * as GuiFactory from 'hugemce/alloy/api/component/GuiFactory';
import * as Attachment from 'hugemce/alloy/api/system/Attachment';
import * as Gui from 'hugemce/alloy/api/system/Gui';

export default (): void => {
  const hugemceUi = SelectorFind.first('#hugemce-ui').getOrDie();

  // Naive resize handler
  const resize = (element: SugarElement<HTMLElement>, changeX: number, changeY: number) => {
    const width = Css.getRaw(element, 'width').map((w) => parseInt(w, 10)).getOrThunk(() => Width.get(element));

    const height = Css.getRaw(element, 'height').map((h) => parseInt(h, 10)).getOrThunk(() => Height.get(element));

    Css.set(element, 'width', (width + changeX) + 'px');
    Css.set(element, 'height', (height + changeY) + 'px');
  };

  const box = GuiFactory.build({
    dom: {
      tag: 'div',
      classes: [ 'demo-pinch-box' ],
      styles: {
        width: '200px',
        height: '200px',
        background: 'black'
      }
    },
    behaviours: Behaviour.derive([
      Pinching.config({
        onPinch: (span, changeX, changeY) => {
          resize(span, changeX, changeY);
        },
        onPunch: (span, changeX, changeY) => {
          resize(span, changeX, changeY);
        }
      })
    ])
  });

  const gui = Gui.create();
  gui.add(box);

  Attachment.attachSystem(hugemceUi, gui);
};

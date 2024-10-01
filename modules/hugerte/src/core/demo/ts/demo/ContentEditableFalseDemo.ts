/* eslint-disable no-console */
import { Global } from '@ephox/katamari';

import { Editor, HugeRTE } from 'hugerte/core/api/PublicApi';
import CaretPosition from 'hugerte/core/caret/CaretPosition';

declare const hugerte: HugeRTE;

export default (): void => {

  const isTextNode = (node: Node): node is Text =>
    node.nodeType === 3;

  const paintClientRect = (rect: DOMRect, color: string, id: string) => {
    const editor = hugerte.activeEditor as Editor;
    const dom = editor.dom;
    const viewPort = editor.dom.getViewPort();

    if (!rect) {
      return;
    }

    color = color || 'red';
    let rectDiv = dom.get(id || color);

    if (!rectDiv) {
      rectDiv = dom.add(editor.getBody(), 'div');
    }

    dom.setAttrib(rectDiv, 'id', id);
    dom.setStyles(rectDiv, {
      position: 'absolute',
      left: (rect.left + viewPort.x) + 'px',
      top: (rect.top + viewPort.y) + 'px',
      width: (rect.width || 1) + 'px',
      height: rect.height + 'px',
      background: color,
      opacity: 0.8
    });
  };

  const paintClientRects = (rects: DOMRect[], color: string) => {
    hugerte.each(rects, (rect, index) => {
      paintClientRect(rect, color, color + index);
    });
  };

  const logPos = (caretPosition: CaretPosition) => {
    const container = caretPosition.container(),
      offset = caretPosition.offset();

    if (isTextNode(container)) {
      if (container.data[offset]) {
        console.log(container.data[offset]);
      } else {
        console.log('<end of text node>');
      }
    } else {
      console.log(container, offset, caretPosition.getNode());
    }
  };

  Global.paintClientRect = paintClientRect;
  Global.paintClientRects = paintClientRects;
  Global.logPos = logPos;

  hugerte.init({
    selector: 'textarea.hugerte',
    skin_url: '../../../../js/hugerte/skins/ui/oxide',
    add_unload_trigger: false,
    toolbar: 'insertfile undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify' +
    ' | bullist numlist outdent indent | link image | print preview media | forecolor backcolor emoticons table codesample',
    plugins: [ 'code' ],
    content_css: '../css/content_editable.css',
    height: 400
  });

  hugerte.init({
    selector: 'div.hugerte',
    inline: true,
    skin_url: '../../../../js/hugerte/skins/ui/oxide',
    add_unload_trigger: false,
    toolbar: 'insertfile undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify' +
    ' | bullist numlist outdent indent | link image | print preview media | forecolor backcolor emoticons table codesample',
    plugins: [ 'code' ],
    content_css: '../css/content_editable.css'
  });
};

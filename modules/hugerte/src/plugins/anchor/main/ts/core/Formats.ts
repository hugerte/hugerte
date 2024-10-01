import Editor from 'hugerte/core/api/Editor';
import { Format } from 'hugerte/core/fmt/FormatTypes';

import * as Utils from './Utils';

const registerFormats = (editor: Editor): void => {
  editor.formatter.register('namedAnchor', {
    inline: 'a',
    selector: Utils.namedAnchorSelector,
    remove: 'all',
    split: true,
    deep: true,
    attributes: {
      id: '%value'
    },
    onmatch: (node: Node, _fmt: Format, _itemName: string) => {
      return Utils.isNamedAnchor(node);
    }
  });
};

export {
  registerFormats
};

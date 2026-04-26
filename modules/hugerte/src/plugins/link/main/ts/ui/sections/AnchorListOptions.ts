
import Editor from 'hugerte/core/api/Editor';

import { ListItem } from '../DialogTypes';

// NOTE: you currently need anchors in the content for this field to appear

const getAnchors = (editor: Editor): (ListItem[]) | null => {
  const anchorNodes = editor.dom.select<HTMLAnchorElement>('a:not([href])');
  const anchors = (anchorNodes).flatMap((anchor) => {
    const id = anchor.name || anchor.id;
    return id ? [{ text: id, value: '#' + id }] : [ ];
  });

  return anchors.length > 0 ? [{ text: 'None', value: '' }].concat(anchors) : null;
};

export const AnchorListOptions = {
  getAnchors
};

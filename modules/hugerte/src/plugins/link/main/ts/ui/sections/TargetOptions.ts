
import Editor from 'hugerte/core/api/Editor';

import * as Options from '../../api/Options';
import { ListOptions } from '../../core/ListOptions';
import { ListItem } from '../DialogTypes';

// In current hugerte, targets can be nested menus.
// Do we really want to support that?

const fallbacks = [
  { text: 'Current window', value: '' },
  { text: 'New window', value: '_blank' }
];

const getTargets = (editor: Editor): (ListItem[]) | null => {
  const list = Options.getTargetList(editor);
  if (Array.isArray(list)) {
    return ListOptions.sanitize(list).orThunk(
      () => fallbacks
    );
  } else if (list === false) {
    return null;
  }
  return fallbacks;
};

export const TargetOptions = {
  getTargets
};


import Editor from 'hugerte/core/api/Editor';

import * as Options from '../../api/Options';
import { ListOptions } from '../../core/ListOptions';
import * as Utils from '../../core/Utils';
import { ListItem, UserListItem } from '../DialogTypes';

const getRels = (editor: Editor, initialTarget: (string) | null): (ListItem[]) | null => {
  const list = Options.getRelList(editor);
  if (list.length > 0) {
    const isTargetBlank = (initialTarget !== null && (initialTarget) === ('_blank'));
    const enforceSafe = Options.allowUnsafeLinkTarget(editor) === false;
    const safeRelExtractor = (item: UserListItem) => Utils.applyRelTargetRules(ListOptions.getValue(item), isTargetBlank);
    const sanitizer = enforceSafe ? ListOptions.sanitizeWith(safeRelExtractor) : ListOptions.sanitize;
    return sanitizer(list);
  }
  return null;
};

export const RelOptions = {
  getRels
};

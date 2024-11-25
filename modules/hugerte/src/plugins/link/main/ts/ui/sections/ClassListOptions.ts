import { Optional } from "@hugerte/katamari";

import Editor from 'hugerte/core/api/Editor';

import * as Options from '../../api/Options';
import { ListOptions } from '../../core/ListOptions';
import { ListItem } from '../DialogTypes';

// Looks like hugerte currently renders menus, but doesn't
// let you choose from one.

const getClasses = (editor: Editor): Optional<ListItem[]> => {
  const list = Options.getLinkClassList(editor);
  if (list.length > 0) {
    return ListOptions.sanitize(list);
  }
  return Optional.none();
};

export const ClassListOptions = {
  getClasses
};

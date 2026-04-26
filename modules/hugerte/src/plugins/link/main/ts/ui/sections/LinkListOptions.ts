
import Editor from 'hugerte/core/api/Editor';

import * as Options from '../../api/Options';
import { ListOptions } from '../../core/ListOptions';
import { ListItem, UserListItem } from '../DialogTypes';

const parseJson = (text: string): (ListItem[]) | null => {
  // Do some proper modelling.
  try {
    return JSON.parse(text);
  } catch (err) {
    return null;
  }
};

const getLinks = (editor: Editor): Promise<(ListItem[]) | null> => {
  const extractor = (item: UserListItem) => editor.convertURL(item.value || item.url || '', 'href');

  const linkList = Options.getLinkList(editor);
  return new Promise<(UserListItem[]) | null>((resolve) => {
    // TODO - better handling of failure
    if (typeof (linkList) === 'string') {
      fetch(linkList)
        .then((res) => res.ok ? res.text().then(parseJson) : Promise.reject())
        .then(resolve, () => resolve(null));
    } else if (typeof (linkList) === 'function') {
      linkList((output) => resolve(output));
    } else {
      resolve((linkList ?? null));
    }
  }).then((optItems) => optItems.bind(ListOptions.sanitizeWith(extractor)).map((items) => {
    if (items.length > 0) {
      const noneItem: ListItem[] = [{ text: 'None', value: '' }];
      return noneItem.concat(items);
    } else {
      return items;
    }
  }));
};

export const LinkListOptions = {
  getLinks
};

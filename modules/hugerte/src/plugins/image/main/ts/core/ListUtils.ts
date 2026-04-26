
import Tools from 'hugerte/core/api/util/Tools';

import { ListGroup, ListItem, ListValue, UserListItem } from '../ui/DialogTypes';

export type ListExtractor = (item: UserListItem) => string;

const getValue: ListExtractor = (item) => typeof (item.value) === 'string' ? item.value : '';

const getText = (item: UserListItem): string => {
  if (typeof (item.text) === 'string') {
    return item.text;
  } else if (typeof (item.title) === 'string') {
    return item.title;
  } else {
    return '';
  }
};

const sanitizeList = (list: UserListItem[], extractValue: ListExtractor): ListItem[] => {
  const out: ListItem[] = [];
  Tools.each(list, (item) => {
    const text = getText(item);
    if (item.menu !== undefined) {
      const items = sanitizeList(item.menu, extractValue);
      out.push({ text, items }); // list group
    } else {
      const value = extractValue(item);
      out.push({ text, value }); // list value
    }
  });
  return out;
};

const sanitizer = (extractor: ListExtractor = getValue) => (list: UserListItem[] | undefined | false): (ListItem[]) | null => {
  if (list) {
    return (list ?? null).map((list) => sanitizeList(list, extractor));
  } else {
    return null;
  }
};

const sanitize = (list: UserListItem[] | undefined): (ListItem[]) | null =>
  sanitizer(getValue)(list);

const isGroup = (item: ListItem): item is ListGroup =>
  Object.prototype.hasOwnProperty.call(item as ListGroup, 'items');

const findEntryDelegate = (list: ListItem[], value: string): (ListValue) | null =>
  ((list) as any[]).reduce<any>((acc: any, x: any) => acc !== null ? acc : ((item) => {
    if (isGroup(item)) {
      return findEntryDelegate(item.items, value);
    } else if (item.value === value) {
      return item;
    } else {
      return null;
    }
  })(x), null);

const findEntry = (optList: (ListItem[]) | null, value: string): (ListValue) | null =>
  optList.bind((list) => findEntryDelegate(list, value));

export const ListUtils = {
  sanitizer,
  sanitize,
  findEntry
};

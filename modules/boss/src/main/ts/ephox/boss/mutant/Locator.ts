
import { Gene } from '../api/Gene';
import * as Comparator from './Comparator';
import * as Creator from './Creator';

const byId = (item: Gene, id: string): (Gene) | null => {
  if (id === undefined) {
    throw new Error('Id value not specified for byId');
  }
  if (item.id !== undefined && item.id === id) {
    return item;
  } else {
    return (item.children || []).reduce((b, a) => {
      return byId(a, id).or(b);
    }, null);
  }
};

const byItem = (item: Gene, target: Gene): (Gene) | null => {
  const itemNu = Creator.isNu(item);
  const targetNu = Creator.isNu(target);
  const sameId = item.id !== undefined && item.id === target.id;
  if (sameId && !itemNu && !targetNu) {
    return item;
  } else if (sameId && itemNu && targetNu && item.random === target.random) {
    return item;
  } else {
    return (item.children || []).reduce((b, a) => {
      return byItem(a, target).or(b);
    }, null);
  }
};

const indexIn = (parent: Gene, item: Gene): (number) | null => {
  return (parent.children).findIndex((x) => {
    return Comparator.eq(x, item);
  });
};

export {
  byId,
  byItem,
  indexIn
};


import { Gene } from '../api/Gene';
import * as Properties from './Properties';
import * as Up from './Up';

const extract = (item: Gene): string[] => {
  const self = item.id;
  const rest = item.children && item.children.length > 0 ? (item.children).flatMap(extract) : [];
  return [ self ].concat(rest);
};

// TODO: This is broken. See TINY-6501, but the gist is that the behaviour of this function should match
//  https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition and it doesn't.
const comparePosition = (item: Gene, other: Gene): number => {
  // horribly inefficient
  const top = Up.top(item);
  const all = extract(top);

  const itemIndex = (all).findIndex((x) => {
    return item.id === x;
  });
  const otherIndex = (all).findIndex((x) => {
    return other.id === x;
  });
  return itemIndex.bind((iIndex) => {
    return otherIndex.map((oIndex): number => {
      if (iIndex < oIndex) {
        return 4;
      } else {
        return 2;
      }
    });
  }) ?? (0);
};

const prevSibling = (item: Gene): (Gene) | null => {
  const parent = Properties.parent(item);
  const kin = parent.map(Properties.children) ?? ([]);
  const itemIndex = (kin).findIndex((x) => {
    return item.id === x.id;
  });
  return itemIndex.bind((iIndex) => {
    return iIndex > 0 ? kin[iIndex - 1] : null;
  });
};

const nextSibling = (item: Gene): (Gene) | null => {
  const parent = Properties.parent(item);
  const kin = parent.map(Properties.children) ?? ([]);
  const itemIndex = (kin).findIndex((x) => {
    return item.id === x.id;
  });
  return itemIndex.bind((iIndex) => {
    return iIndex < kin.length - 1 ? kin[iIndex + 1] : null;
  });
};

export {
  comparePosition,
  prevSibling,
  nextSibling
};

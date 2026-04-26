import { Universe } from '@ephox/boss';

import * as Extract from '../api/general/Extract';
import { OrphanText } from '../wrap/OrphanText';
import * as Parents from './Parents';

const index = <E, D>(universe: Universe<E, D>, items: E[], item: E) => {
  return (items).findIndex(((..._rest: any[]) => (universe.eq)(item, ..._rest)));
};

const order = <E>(items: E[], a: number, delta1: number, b: number, delta2: number) => {
  return a < b ? items.slice(a + delta1, b + delta2) : items.slice(b + delta2, a + delta1);
};

/**
 * Returns a flat array of text nodes between two defined nodes.
 *
 * Deltas are a broken concept. They control whether the item passed is included in the result.
 */
const range = <E, D>(universe: Universe<E, D>, item1: E, delta1: number, item2: E, delta2: number): E[] => {
  if (universe.eq(item1, item2)) {
    return [ item1 ];
  }

  return Parents.common(universe, item1, item2).fold<E[]>(() => {
    return []; // no common parent, therefore no intervening path. How does this clash with Path in robin?
  }, (parent) => {
    const items = [ parent ].concat(Extract.all<E, D>(universe, parent, (() => false as const)));
    const start = index(universe, items, item1);
    const finish = index(universe, items, item2);
    const result = start.bind((startIndex) => {
      return finish.map((finishIndex) => {
        return order(items, startIndex, delta1, finishIndex, delta2);
      });
    }) ?? ([]);
    const orphanText = OrphanText(universe);
    return (result).filter(orphanText.validateText);
  });
};

export {
  range
};

import { Universe } from '@ephox/boss';

/**
 * Search the parents of both items for a common element
 */
const common = <E, D>(universe: Universe<E, D>, item1: E, item2: E): (E) | null => {
  const item1parents = [ item1 ].concat(universe.up().all(item1));
  const item2parents = [ item2 ].concat(universe.up().all(item2));

  return ((item1parents).find((x) => {
    return (item2parents).some((y) => {
      return universe.eq(y, x);
    });
  }) ?? null);
};

export {
  common
};

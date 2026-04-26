import { Universe } from '@ephox/boss';

const eq = <E, D>(universe: Universe<E, D>, e1: E): (e2: E) => boolean => {
  return ((..._rest: any[]) => (universe.eq)(e1, ..._rest));
};

const isDuplicate = <E, D>(universe: Universe<E, D>, rest: E[], item: E): boolean => {
  return (rest).some(eq(universe, item));
};

const isChild = <E, D>(universe: Universe<E, D>, rest: E[], item: E): boolean => {
  const parents = universe.up().all(item);
  return (parents).some((p) => {
    return isDuplicate(universe, rest, p);
  });
};

/**
 * Flattens the item list into just the top-most elements in the tree.
 *
 * In other words, removes duplicates and children.
 */
const simplify = <E, D>(universe: Universe<E, D>, items: E[]): E[] => {
// FIX: Horribly inefficient.
  return (items).filter((x, i) => {
    const left = items.slice(0, i);
    const right = items.slice(i + 1);
    const rest = left.concat(right);
    return !(isDuplicate(universe, right, x) || isChild(universe, rest, x));
  });
};

export {
  simplify
};

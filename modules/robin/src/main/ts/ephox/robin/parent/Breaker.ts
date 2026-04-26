import { Universe } from '@ephox/boss';

interface Bisect<E> {
  readonly before: E[];
  readonly after: E[];
}

export interface LeftRight<E> {
  readonly left: E;
  readonly right: E;
}

export interface BrokenPathSplits<E> {
  readonly first: E;
  readonly second: E;
}

export interface BrokenPath<E> {
  readonly first: E;
  readonly second: (E) | null;
  readonly splits: BrokenPathSplits<E>[];
}

const leftRight = <E>(left: E, right: E): LeftRight<E> => ({
  left,
  right
});

const brokenPath = <E>(first: E, second: (E) | null, splits: BrokenPathSplits<E>[]): BrokenPath<E> => ({
  first,
  second,
  splits
});

const bisect = <E, D>(universe: Universe<E, D>, parent: E, child: E): (Bisect<E>) | null => {
  const children = universe.property().children(parent);
  const index = (children).findIndex(((..._rest: any[]) => (universe.eq)(child, ..._rest)));
  return index.map((ind) => {
    return {
      before: children.slice(0, ind),
      after: children.slice(ind + 1)
    };
  });
};

/**
 * Clone parent to the RIGHT and move everything after child in the parent element into
 * a clone of the parent (placed after parent).
 */
const breakToRight = <E, D>(universe: Universe<E, D>, parent: E, child: E): (LeftRight<E>) | null => {
  return bisect(universe, parent, child).map((parts) => {
    const second = universe.create().clone(parent);
    universe.insert().appendAll(second, parts.after);
    universe.insert().after(parent, second);
    return leftRight(parent, second);
  });
};

/**
 * Clone parent to the LEFT and move everything before and including child into
 * the a clone of the parent (placed before parent)
 */
const breakToLeft = <E, D>(universe: Universe<E, D>, parent: E, child: E): (LeftRight<E>) | null => {
  return bisect(universe, parent, child).map((parts) => {
    const prior = universe.create().clone(parent);
    universe.insert().appendAll(prior, parts.before.concat([ child ]));
    universe.insert().appendAll(parent, parts.after);
    universe.insert().before(parent, prior);
    return leftRight(prior, parent);
  });
};

/*
 * Using the breaker, break from the child up to the top element defined by the predicate.
 * It returns three values:
 *   first: the top level element that completed the break
 *   second: the optional element representing second part of the top-level split if the breaking completed successfully to the top
 *   splits: a list of (Element, Element) pairs that represent the splits that have occurred on the way to the top.
 */
const breakPath = <E, D>(universe: Universe<E, D>, item: E, isTop: (e: E) => boolean, breaker: (universe: Universe<E, D>, parent: E, child: E) => (LeftRight<E>) | null): BrokenPath<E> => {

  const next = (child: E, group: (E) | null, splits: BrokenPathSplits<E>[]): BrokenPath<E> => {
    const fallback = brokenPath(child, null, splits);
    // Found the top, so stop.
    if (isTop(child)) {
      return brokenPath(child, group, splits);
    } else {
      // Split the child at parent, and keep going
      return universe.property().parent(child).bind((parent: E) => {
        return breaker(universe, parent, child).map((breakage) => {
          const extra = [{ first: breakage.left, second: breakage.right }];
          // Our isTop is based on the left-side parent, so keep it regardless of split.
          const nextChild = isTop(parent) ? parent : breakage.left;
          return next(nextChild, breakage.right, splits.concat(extra));
        });
      }) ?? (fallback);
    }
  };

  return next(item, null, []);
};

export { breakToLeft, breakToRight, breakPath };

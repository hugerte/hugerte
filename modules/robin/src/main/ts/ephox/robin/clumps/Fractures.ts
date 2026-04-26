import { Universe } from '@ephox/boss';

import * as Parent from '../api/general/Parent';
import { breakToLeft, breakToRight, BrokenPath, LeftRight } from '../parent/Breaker';
import * as Subset from '../parent/Subset';

// Find the subsection of DIRECT children of parent from [first, last])
const slice = <E, D>(universe: Universe<E, D>, parent: E, first: (E) | null, last: (E) | null): (E[]) | null => {
  const children = universe.property().children(parent);

  const finder = (elem: E) => {
    return (children).findIndex(((..._rest: any[]) => (universe.eq)(elem, ..._rest)));
  };

  // Default to the start of the common parent.
  const firstIndex = first.bind(finder) ?? (0);
  // Default to the end of the common parent.
  const lastIndex = last.bind(finder) ?? (children.length - 1);
  return firstIndex > -1 && lastIndex > -1 ? children.slice(firstIndex, lastIndex + 1) : null;
};

const breakPath = <E, D>(universe: Universe<E, D>, element: E, common: E, breaker: (universe: Universe<E, D>, parent: E, child: E) => (LeftRight<E>) | null): BrokenPath<E> => {
  const isTop = (elem: E) => {
    return universe.property().parent(elem).fold(
      (() => true as const),
      ((..._rest: any[]) => (universe.eq)(common, ..._rest))
    );
  };

  return Parent.breakPath(universe, element, isTop, breaker);
};

const breakLeft = <E, D>(universe: Universe<E, D>, element: E, common: E): (E) | null => {
  // If we are the top and we are the left, use default value
  if (universe.eq(common, element)) {
    return null;
  } else {
    const breakage = breakPath(universe, element, common, breakToLeft);
    // Move the first element into the second section of the split because we want to include element in the section.
    if (breakage.splits.length > 0) {
      universe.insert().prepend(breakage.splits[0].second, element);
    }
    return breakage.second ?? (element);
  }
};

const breakRight = <E, D>(universe: Universe<E, D>, element: E, common: E): (E) | null => {
  // If we are the top and we are the right, use default value
  if (universe.eq(common, element)) {
    return null;
  } else {
    const breakage = breakPath(universe, element, common, breakToRight);
    return breakage.first;
  }
};

const same = <E, D>(universe: Universe<E, D>, isRoot: (e: E) => boolean, element: E, ceiling: (e: E) => E): (E[]) | null => {
  const common = ceiling(element);
  // If there are no important formatting elements above, just return element, otherwise split to important element above.
  return universe.eq(common, element) ? [ element ] : breakToCommon(universe, common, element, element);
};

const breakToCommon = <E, D>(universe: Universe<E, D>, common: E, start: E, finish: E): (E[]) | null => {
  // We have the important top-level shared ancestor, we now have to split from the start and finish up
  // to the shared parent. Break from the first node to the common parent AFTER the second break as the first
  // will impact the second (assuming LEFT to RIGHT) and not vice versa.
  const secondBreak = breakRight(universe, finish, common);
  const firstBreak = breakLeft(universe, start, common);
  return slice(universe, common, firstBreak, secondBreak);
};

// Find the shared ancestor that we are going to split up to.
const shared = <E, D>(universe: Universe<E, D>, isRoot: (e: E) => boolean, start: E, finish: E, ceiling: (e: E) => E): (E) | null => {
  const subset = Subset.ancestors(universe, start, finish, isRoot);
  return subset.shared.orThunk(() => {
    // Default to shared root, if we don't have a shared ancestor.
    return Parent.sharedOne(universe, (_, elem) => {
      return isRoot(elem) ? elem : universe.up().predicate(elem, isRoot);
    }, [ start, finish ]);
  }).map(ceiling);
};

const diff = <E, D>(universe: Universe<E, D>, isRoot: (e: E) => boolean, start: E, finish: E, ceiling: (e: E) => E): (E[]) | null => {
  return shared(universe, isRoot, start, finish, ceiling).bind((common) => {
    return breakToCommon(universe, common, start, finish);
  });
};

const fracture = <E, D>(universe: Universe<E, D>, isRoot: (e: E) => boolean, start: E, finish: E, ceiling: (e: E) => E = (x: any) => x): (E[]) | null => {
  return universe.eq(start, finish) ? same(universe, isRoot, start, ceiling) : diff(universe, isRoot, start, finish, ceiling);
};

export {
  fracture
};

import { Universe } from '@ephox/boss';

import { Direction, Transition } from '../api/data/Types';
import * as Walker from './Walker';
import { Walkers } from './Walkers';

const hone = <E, D>(universe: Universe<E, D>, item: E, predicate: (e: E) => boolean, mode: Transition, direction: Direction, isRoot: (e: E) => boolean): (E) | null => {
  const next = Walker.go(universe, item, mode, direction);
  return next.bind((n) => {
    if (isRoot(n.item)) {
      return null;
    } else {
      return predicate(n.item) ? n.item : hone(universe, n.item, predicate, n.mode, direction, isRoot);
    }
  });
};

const left = <E, D>(universe: Universe<E, D>, item: E, predicate: (e: E) => boolean, isRoot: (e: E) => boolean): (E) | null => {
  return hone(universe, item, predicate, Walker.sidestep, Walkers.left(), isRoot);
};

const right = <E, D>(universe: Universe<E, D>, item: E, predicate: (e: E) => boolean, isRoot: (e: E) => boolean): (E) | null => {
  return hone(universe, item, predicate, Walker.sidestep, Walkers.right(), isRoot);
};

export {
  left,
  right
};

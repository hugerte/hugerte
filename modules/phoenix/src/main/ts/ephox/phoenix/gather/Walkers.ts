import { Universe } from '@ephox/boss';

import { Direction } from '../api/data/Types';

const left = (): Direction => {
  const sibling = <E, D>(universe: Universe<E, D>, item: E) => {
    return universe.query().prevSibling(item);
  };

  const first = <E>(children: E[]): (E) | null => {
    return children.length > 0 ? children[children.length - 1] : null;
  };

  return {
    sibling,
    first
  };
};

const right = (): Direction => {
  const sibling = <E, D>(universe: Universe<E, D>, item: E) => {
    return universe.query().nextSibling(item);
  };

  const first = <E>(children: E[]): (E) | null => {
    return children.length > 0 ? children[0] : null;
  };

  return {
    sibling,
    first
  };
};

export const Walkers = {
  left,
  right
};

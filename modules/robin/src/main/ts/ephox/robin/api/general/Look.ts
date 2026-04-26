import { Universe } from '@ephox/boss';

import * as Look from '../../look/Look';

const selector = <E, D>(_universe: Universe<E, D>, sel: string): (universe: Universe<E, D>, item: E) => (E) | null => {
  return Look.selector(sel);
};

const predicate = <E, D>(_universe: Universe<E, D>, pred: (e: E) => boolean): (universe: Universe<E, D>, item: E) => (E) | null => {
  return Look.predicate(pred);
};

const exact = <E, D>(universe: Universe<E, D>, item: E): (universe: Universe<E, D>, item: E) => (E) | null => {
  const itemMatch = ((..._rest: any[]) => (universe.eq)(item, ..._rest));

  return Look.predicate(itemMatch);
};

export {
  selector,
  predicate,
  exact
};

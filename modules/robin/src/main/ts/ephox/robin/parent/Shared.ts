import { Universe } from '@ephox/boss';

export type Looker<E, D> = (universe: Universe<E, D>, elem: E) => (E) | null;

const all = <E, D>(universe: Universe<E, D>, look: Looker<E, D>, elements: E[], f: (universe: Universe<E, D>, look: Looker<E, D>, head: E, tail: E[]) => (E) | null): (E) | null => {
  const head = elements[0];
  const tail = elements.slice(1);
  return f(universe, look, head, tail);
};

/**
 * Check if look returns the same element for all elements, and return it if it exists.
 */
const oneAll = <E, D>(universe: Universe<E, D>, look: Looker<E, D>, elements: E[]): (E) | null => {
  return elements.length > 0 ?
    all(universe, look, elements, unsafeOne) :
    null;
};

const unsafeOne = <E, D>(universe: Universe<E, D>, look: Looker<E, D>, head: E, tail: E[]): (E) | null => {
  const start = look(universe, head);
  return (tail).reduceRight((b, a) => {
    const current = look(universe, a);
    return commonElement(universe, b, current);
  }, start);
};

const commonElement = <E, D>(universe: Universe<E, D>, start: (E) | null, end: (E) | null): (E) | null => {
  return start.bind((s) => {
    return end.filter(((..._rest: any[]) => (universe.eq)(s, ..._rest)));
  });
};

export { oneAll };

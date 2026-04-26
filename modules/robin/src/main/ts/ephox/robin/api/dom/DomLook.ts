import { DomUniverse } from '@ephox/boss';
import { SugarElement } from '@ephox/sugar';

import * as Look from '../general/Look';

const universe = DomUniverse();

const selector = (sel: string) => {
  return (item: SugarElement): (SugarElement) | null => Look.selector(universe, sel)(universe, item);
};

const predicate = (pred: (e: SugarElement) => boolean) => {
  return (item: SugarElement): (SugarElement) | null => Look.predicate(universe, pred)(universe, item);
};

const exact = (element: SugarElement) => {
  return (item: SugarElement): (SugarElement) | null => Look.exact(universe, element)(universe, item);
};

export {
  selector,
  predicate,
  exact
};

import { DomUniverse } from "@hugerte/boss";
import { Optional } from "@hugerte/katamari";
import { SugarElement } from "@hugerte/sugar";

import * as Look from '../general/Look';

const universe = DomUniverse();

const selector = (sel: string) => {
  return (item: SugarElement): Optional<SugarElement> => Look.selector(universe, sel)(universe, item);
};

const predicate = (pred: (e: SugarElement) => boolean) => {
  return (item: SugarElement): Optional<SugarElement> => Look.predicate(universe, pred)(universe, item);
};

const exact = (element: SugarElement) => {
  return (item: SugarElement): Optional<SugarElement> => Look.exact(universe, element)(universe, item);
};

export {
  selector,
  predicate,
  exact
};

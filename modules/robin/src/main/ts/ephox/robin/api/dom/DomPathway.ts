import { DomUniverse } from "@hugerte/boss";
import { SugarElement } from "@hugerte/sugar";

import * as Pathway from '../general/Pathway';

const universe = DomUniverse();

const simplify = (elements: SugarElement[]): SugarElement[] => {
  return Pathway.simplify(universe, elements);
};

export {
  simplify
};

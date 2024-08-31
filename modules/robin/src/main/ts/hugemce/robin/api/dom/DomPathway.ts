import { DomUniverse } from '@hugemce/boss';
import { SugarElement } from '@hugemce/sugar';

import * as Pathway from '../general/Pathway';

const universe = DomUniverse();

const simplify = (elements: SugarElement[]): SugarElement[] => {
  return Pathway.simplify(universe, elements);
};

export {
  simplify
};

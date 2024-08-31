import { DomUniverse } from '@hugemce/boss';
import { SugarElement } from '@hugemce/sugar';

import { Textdata } from '../general/Textdata';

const universe = DomUniverse();

const from = (elements: SugarElement[], current: SugarElement, offset: number): Textdata<SugarElement> => {
  return Textdata.from(universe, elements, current, offset);
};

export {
  from
};

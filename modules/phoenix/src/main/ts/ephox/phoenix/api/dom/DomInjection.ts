import { DomUniverse } from "@hugerte/boss";
import { SugarElement } from "@hugerte/sugar";

import * as Injection from '../general/Injection';

const universe = DomUniverse();

const atStartOf = (element: SugarElement, offset: number, injection: SugarElement): void => {
  Injection.atStartOf(universe, element, offset, injection);
};

export {
  atStartOf
};

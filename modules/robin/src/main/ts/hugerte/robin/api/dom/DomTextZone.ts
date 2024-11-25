import { DomUniverse } from "@hugerte/boss";
import { Optional } from "@hugerte/katamari";
import { SugarElement } from "@hugerte/sugar";

import * as TextZone from '../general/TextZone';

const universe = DomUniverse();

const single = (element: SugarElement, envLang: string, onlyLang: string): Optional<TextZone.Zone<SugarElement>> => {
  return TextZone.single(universe, element, envLang, onlyLang);
};

const range = (start: SugarElement, soffset: number, finish: SugarElement, foffset: number, envLang: string, onlyLang: string): Optional<TextZone.Zone<SugarElement>> => {
  return TextZone.range(universe, start, soffset, finish, foffset, envLang, onlyLang);
};

export {
  single,
  range
};

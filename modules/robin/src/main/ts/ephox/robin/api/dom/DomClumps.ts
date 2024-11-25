import { DomUniverse } from "@hugerte/boss";
import { Optional } from "@hugerte/katamari";
import { SugarElement } from "@hugerte/sugar";

import * as Clumps from '../general/Clumps';

const universe = DomUniverse();

/* See general.Clumps for explanation. */
const fractures = (isRoot: (e: SugarElement) => boolean, start: SugarElement, soffset: number, finish: SugarElement, foffset: number, ceiling?: (e: SugarElement) => SugarElement): SugarElement[][] => {
  return Clumps.fractures(universe, isRoot, start, soffset, finish, foffset, ceiling);
};

const fracture = (isRoot: (e: SugarElement) => boolean, start: SugarElement, soffset: number, finish: SugarElement, foffset: number, ceiling?: (e: SugarElement) => SugarElement): Optional<SugarElement[]> => {
  return Clumps.fracture(universe, isRoot, start, soffset, finish, foffset, ceiling);
};

export {
  fractures,
  fracture
};

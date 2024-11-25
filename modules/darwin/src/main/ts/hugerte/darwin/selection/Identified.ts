import { Optional } from "@hugerte/katamari";
import { SugarElement } from "@hugerte/sugar";

export interface Identified {
  readonly boxes: Optional<SugarElement<HTMLTableCellElement>[]>;
  readonly start: SugarElement<HTMLTableCellElement>;
  readonly finish: SugarElement<HTMLTableCellElement>;
}

export interface IdentifiedExt {
  readonly boxes: SugarElement<HTMLTableCellElement>[];
  readonly start: SugarElement<HTMLTableCellElement>;
  readonly finish: SugarElement<HTMLTableCellElement>;
}

import { Optional } from '@hugemce/katamari';
import { SugarElement } from '@hugemce/sugar';

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

import { SugarElement } from '@ephox/sugar';

export interface Identified {
  readonly boxes: (SugarElement<HTMLTableCellElement>[]) | null;
  readonly start: SugarElement<HTMLTableCellElement>;
  readonly finish: SugarElement<HTMLTableCellElement>;
}

export interface IdentifiedExt {
  readonly boxes: SugarElement<HTMLTableCellElement>[];
  readonly start: SugarElement<HTMLTableCellElement>;
  readonly finish: SugarElement<HTMLTableCellElement>;
}

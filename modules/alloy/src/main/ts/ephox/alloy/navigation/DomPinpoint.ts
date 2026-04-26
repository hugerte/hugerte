import { Compare, SelectorFilter, SugarElement, Visibility } from '@ephox/sugar';

import * as ArrPinpoint from './ArrPinpoint';

const locateVisible = (container: SugarElement<HTMLElement>, current: SugarElement<HTMLElement>, selector: string): (ArrPinpoint.IndexInfo<SugarElement<HTMLElement>>) | null => {
  const predicate = (x: SugarElement<Node>) => Compare.eq(x, current);
  const candidates = SelectorFilter.descendants<HTMLElement>(container, selector);
  const visible = (candidates).filter(Visibility.isVisible);
  return ArrPinpoint.locate(visible, predicate);
};

const findIndex = <T> (elements: Array<SugarElement<T>>, target: SugarElement<T>): (number) | null =>
  (elements).findIndex((elem) => Compare.eq(target, elem));

export {
  locateVisible,
  findIndex
};


import { Arrays } from '@ephox/polaris';

import * as Spot from '../api/data/Spot';
import { TypedItem } from '../api/data/TypedItem';
import { SpotRange } from '../api/data/Types';

const count = <E, D>(parray: TypedItem<E, D>[]): number => {
  return (parray).reduceRight((b, a) => {
    return a.len() + b;
  }, 0);
};

const dropUntil = <E, D>(parray: TypedItem<E, D>[], target: E): TypedItem<E, D>[] => {
  return Arrays.sliceby(parray, (x) => {
    return x.is(target);
  });
};

/**
 * Transform a TypedItem into a range representing that item from the start position.
 *
 * The generation function for making a PositionArray out of a list of TypedItems.
 */
const gen = <E, D>(unit: TypedItem<E, D>, start: number): (SpotRange<E>) | null => {
  return unit.fold(() => null, (e) => {
    return Spot.range(e, start, start + 1);
  }, (t) => {
    return Spot.range(t, start, start + unit.len());
  }, () => null);
};

const empty = () => [];

const justText = <E, D>(parray: TypedItem<E, D>[]): E[] => {
  return (parray).flatMap((x): E[] => {
    return x.fold(empty, empty, (i) => {
      return [ i ];
    }, empty);
  });
};

export {
  count,
  dropUntil,
  gen,
  justText
};

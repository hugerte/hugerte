import { Obj } from '@ephox/katamari';
import * as fc from 'fast-check';

export interface WeightedItem {
  useDepth?: boolean;
  weight: number;
}

export interface AccWeightItem {
  accWeight: number;
}

export interface WeightedList<T extends WeightedItem> {
  readonly list: (T & AccWeightItem)[];
  readonly total: number;
}

const weighted = <T extends WeightedItem> (list: (T & AccWeightItem)[], total: number): WeightedList<T> => ({
  list,
  total
});

const choose = <T extends WeightedItem>(candidates: T[]): WeightedList<T> => {
  const result = candidates.reduce((rest, d) => {
    const newTotal = rest.total + d.weight;
    const merged: T & AccWeightItem = {
      ...d,
      accWeight: newTotal
    };
    return {
      total: newTotal,
      list: rest.list.concat([ merged ])
    };
  }, { list: [] as Array<T & AccWeightItem>, total: 0 });

  return weighted(result.list, result.total);
};

const gChoose = <T extends WeightedItem>(weighted: WeightedList<T>): fc.Arbitrary<T & AccWeightItem | null> =>
  fc.float({ min: 0, max: weighted.total }).map((w): T & AccWeightItem | null => {
    const raw = (weighted.list.find((d) =>
      w <= d.accWeight) ?? null);

    const keys = raw.map(Obj.keys) ?? [];
    return keys.length === [ 'weight', 'accWeight' ].length ? null : raw;
  });

const generator = <T extends WeightedItem>(candidates: T[]): fc.Arbitrary<T & AccWeightItem | null> => {
  const list = choose(candidates);
  return gChoose(list);
};

export {
  generator
};

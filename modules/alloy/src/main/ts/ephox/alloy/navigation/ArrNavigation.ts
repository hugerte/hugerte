
export type ArrCycle<A> = (values: A[], index: number, predicate: (a: A) => boolean) => (A) | null;

const cyclePrev = <A>(values: A[], index: number, predicate: (a: A) => boolean): (A) | null => {
  const before = [...(values.slice(0, index))].reverse();
  const after = [...(values.slice(index + 1))].reverse();
  return ((before.concat(after)).find(predicate) ?? null);
};

const tryPrev = <A>(values: A[], index: number, predicate: (a: A) => boolean): (A) | null => {
  const before = [...(values.slice(0, index))].reverse();
  return ((before).find(predicate) ?? null);
};

const cycleNext = <A>(values: A[], index: number, predicate: (a: A) => boolean): (A) | null => {
  const before = values.slice(0, index);
  const after = values.slice(index + 1);
  return ((after.concat(before)).find(predicate) ?? null);
};

const tryNext = <A>(values: A[], index: number, predicate: (a: A) => boolean): (A) | null => {
  const after = values.slice(index + 1);
  return ((after).find(predicate) ?? null);
};

export {
  cyclePrev,
  cycleNext,
  tryPrev,
  tryNext
};


const boundAt = <T, T2>(xs: T[], left: T2, right: T2, comparator: (a: T2, b: T) => boolean): T[] => {
  const leftIndex = (xs).findIndex(((..._rest: any[]) => (comparator)(left, ..._rest)));
  const first = leftIndex ?? (0);
  const rightIndex = (xs).findIndex(((..._rest: any[]) => (comparator)(right, ..._rest)));
  const last = rightIndex.map((rIndex) => {
    return rIndex + 1;
  }) ?? (xs.length);
  return xs.slice(first, last);
};

export {
  boundAt
};

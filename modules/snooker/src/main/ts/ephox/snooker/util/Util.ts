
const unique = <T> (xs: T[], eq: (a: T, b: T) => boolean): T[] => {
  const result: T[] = [];
  (xs).forEach((x, i) => {
    if (i < xs.length - 1 && !eq(x, xs[i + 1])) {
      result.push(x);
    } else if (i === xs.length - 1) {
      result.push(x);
    }
  });
  return result;
};

interface ValueDelta { value: number; delta: number }

const findNeighbour = (xs: (number | null)[], startDelta: number): ValueDelta | null =>
  (xs as (number | null)[]).reduce<ValueDelta | null>(
    (acc, a, i) => acc !== null ? acc : (a !== null ? { value: a, delta: i + startDelta } : null), null
  );

const deduce = (xs: (number | null)[], index: number): (number) | null => {
  if (index < 0 || index >= xs.length - 1) {
    return null;
  }

  const current: ValueDelta | null = xs[index] !== null
    ? { value: xs[index] as number, delta: 0 }
    : findNeighbour([...xs.slice(0, index)].reverse(), 1);

  const next: ValueDelta | null = xs[index + 1] !== null
    ? { value: xs[index + 1] as number, delta: 1 }
    : findNeighbour(xs.slice(index + 1), 1);

  if (current === null || next === null) {
    return null;
  }
  const extras = next.delta + current.delta;
  return Math.abs(next.value - current.value) / extras;
};

export { unique, deduce };

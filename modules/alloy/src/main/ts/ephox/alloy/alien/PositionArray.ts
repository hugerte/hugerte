
export interface PositionableUnit {
  readonly finish: number;
}

const generate = <T, U extends PositionableUnit>(xs: T[], f: (thing: T, n: number) => (U) | null): U[] => {
  const init = {
    len: 0,
    list: [] as U[]
  };

  const r = (xs).reduce((b, a) => {
    const value = f(a, b.len);
    return value.fold(() => b, (v) => ({
      len: v.finish,
      list: b.list.concat([ v ])
    }));
  }, init);

  return r.list;
};

export {
  generate
};

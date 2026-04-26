
const wrap = <V>(key: string, value: V): Record<string, V> => ({ [key]: value });

const wrapAll = <K extends string | number, T>(keyvalues: Array<{ key: K; value: T }>): Record<K, T> => {
  const r = {} as Record<K, T>;
  (keyvalues).forEach((kv) => {
    r[kv.key] = kv.value;
  });
  return r;
};

export {
  wrap,
  wrapAll
};

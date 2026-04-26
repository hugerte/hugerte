
/*
 * This is used to take something like:
 *
 * {
 *   behaviour: {
 *     event1: listener
 *   },
 *   behaviour2: {
 *     event1: listener
 *   }
 * }
 *
 * And turn it into something like:
 *
 * {
 *   event1: [ { b: behaviour1, l: listener }, { b: behaviour2, l: listener } ]
 * }
 */

type OuterKey = string;
type InnerKey = string;

const byInnerKey = <T, O>(data: Record<OuterKey, Record<InnerKey, T>>, tuple: (s: string, t: T) => O):
Record<InnerKey, O[]> => {

  const r: Record<InnerKey, O[]> = {};
  Object.entries(data).forEach(([_k, _v]: [any, any]) => ((detail: Record<InnerKey, T>, key: OuterKey) => {
    Object.entries(detail).forEach(([_k, _v]: [any, any]) => ((value: T, indexKey: InnerKey) => {
      const chain: O[] = ((r)[indexKey] ?? null) ?? ([]);
      r[indexKey] = chain.concat([
        tuple(key, value)
      ]);
    })(_v, _k));
  })(_v, _k));
  return r;
};

export {
  byInnerKey
};

// @ts-nocheck

const narrow = <T extends Record<string, any>, F extends Array<keyof T>>(obj: T, fields: F): Pick<T, F[number]> => {
  const r = { } as Pick<T, F[number]>;
  (fields).forEach((field) => {
    // TODO: Investigate if the undefined check is relied upon by something
    if (obj[field] !== undefined && Object.prototype.hasOwnProperty.call(obj, field)) {
      r[field] = obj[field];
    }
  });

  return r;
};

const indexOnKey = <T extends Record<string, any>, K extends keyof T>(array: ArrayLike<T>, key: K): { [A in T[K]]: T } => {
  const obj = { } as { [A in T[K]]: T };
  (array).forEach((a) => {
    // FIX: Work out what to do here.
    const keyValue: string | number = a[key];
    obj[keyValue] = a;
  });
  return obj;
};

const exclude = <T extends Record<string, any>, F extends Array<keyof T>>(obj: T, fields: F): Omit<T, F[number]> => {
  const r = { } as Omit<T, F[number]>;
  Object.entries(obj).forEach(([_k, _v]: [any, any]) => ((v, k) => {
    if (!(fields).includes(k)) {
      r[k as string] = v;
    }
  })(_v, _k));
  return r;
};

export {
  narrow,
  exclude,
  indexOnKey
};

import { Result } from '@ephox/katamari';

const toValidValues = <T>(values: Record<string, (T) | null>): Result<Record<string, T>, string[]> => {
  const errors: string[] = [];
  const result: Record<string, T> = {};

  Object.entries(values).forEach(([_k, _v]: [any, any]) => ((value: (T) | null, name: string) => {
    value.fold(() => {
      errors.push(name);
    }, (v) => {
      result[name] = v;
    });
  })(_v, _k));

  return errors.length > 0 ? Result.error<Record<string, T>, string[]>(errors) :
    Result.value<Record<string, T>, string[]>(result);
};

export {
  toValidValues
};

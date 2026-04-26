import * as Arr from './Arr';
import * as Obj from './Obj';

export const stringArray = (a: string[]): string[] => {
  const all: Record<string, {}> = {};
  a.forEach((key) => {
    all[key] = {};
  });
  return Object.keys(all);
};

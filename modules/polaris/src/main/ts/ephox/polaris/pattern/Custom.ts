
import { PRegExp } from './Types';

// tslint:disable-next-line:variable-name
export const Custom = (regex: string, prefix: PRegExp['prefix'], suffix: PRegExp['suffix'], flags: (string) | null): PRegExp => {
  const term = () => {
    return new RegExp(regex, flags ?? ('g'));
  };

  return {
    term,
    prefix,
    suffix
  };
};


import Tools from '../api/util/Tools';
import { ElementRule } from './SchemaTypes';

export const split = (items: string | undefined, delim?: string): string[] => {
  items = Tools.trim(items);
  return items ? items.split(delim || ' ') : [];
};

// Converts a wildcard expression string to a regexp for example *a will become /.*a/.
export const patternToRegExp = (str: string): RegExp => new RegExp('^' + str.replace(/([?+*])/g, '.$1') + '$');

const isRegExp = (obj: any): obj is RegExp => (typeof (obj) === 'object' && (obj) !== null) && obj.source && Object.prototype.toString.call(obj) === '[object RegExp]';

export const deepCloneElementRule = (obj: ElementRule): ElementRule => {
  const helper = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return (value).map(helper);
    } else if (isRegExp(value)) {
      return new RegExp(value.source, value.flags);
    } else if ((typeof (value) === 'object' && (value) !== null)) {
      return Object.fromEntries(Object.entries(value).map(([_k, _v]: [any, any]) => [_k, (helper)(_v, _k as any)]));
    } else {
      return value;
    }
  };

  return helper(obj) as ElementRule;
};


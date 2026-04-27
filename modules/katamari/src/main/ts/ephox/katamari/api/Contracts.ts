import * as BagUtils from '../util/BagUtils';
import * as Fun from './Fun';
import * as Type from './Type';

export interface ContractCondition<T> {
  readonly label: string;
  readonly validate: (value: T, key: string) => boolean;
}

type IdentityFn = <T extends Record<string, any>>(obj: T) => T;
type IdentityWithConditionFn<V> = <T extends Record<string, V>>(obj: T) => T;
type HandleFn = (required: string[], keys: string[]) => void;

// Ensure that the object has all required fields. They must be functions.
const base = (handleUnsupported: HandleFn, required: string[]) => {
  return baseWith(handleUnsupported, required, {
    validate: Type.isFunction,
    label: 'function'
  });
};

// Ensure that the object has all required fields. They must satisy predicates.
const baseWith = <V>(handleUnsupported: HandleFn, required: string[], pred: ContractCondition<V>): IdentityFn => {
  if (required.length === 0) {
    throw new Error('You must specify at least one required field.');
  }

  BagUtils.validateStrArr('required', required);

  BagUtils.checkDupes(required);

  return <T extends Record<string, V>>(obj: T) => {
    const keys: string[] = Object.keys(obj);

    // Ensure all required keys are present.
    const allReqd = required.every((req) => {
      return keys.includes(req);
    });

    if (!allReqd) {
      BagUtils.reqMessage(required, keys);
    }

    handleUnsupported(required, keys);

    const invalidKeys = required.filter((key) => {
      return !pred.validate(obj[key], key);
    });

    if (invalidKeys.length > 0) {
      BagUtils.invalidTypeMessage(invalidKeys, pred.label);
    }

    return obj;
  };
};

const handleExact = (required: string[], keys: string[]) => {
  const unsupported = keys.filter((key) => {
    return !required.includes(key);
  });

  if (unsupported.length > 0) {
    BagUtils.unsuppMessage(unsupported);
  }
};

const allowExtra = Fun.noop;

export const exactly = (required: string[]): IdentityFn => base(handleExact, required);
export const ensure = (required: string[]): IdentityFn => base(allowExtra, required);
export const ensureWith = <V>(required: string[], condition: ContractCondition<V>): IdentityWithConditionFn<V> =>
  baseWith(allowExtra, required, condition);

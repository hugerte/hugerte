import { assert } from 'chai';

import { Optional } from 'ephox/katamari/api/Optional';
import { tOptional } from 'ephox/katamari/api/OptionalInstances';

export const assertOptional = <T> (actual: T | null, expected: T | null): void => {
  if (!tOptional().eq(actual, expected)) {
    assert.fail(`Expected ${expected.toString()} but got ${actual.toString()}`);
  }
};

export const assertNone = <T> (actual: T | null): void => {
  assertOptional(actual, null);
};

export const assertSome = <T> (actual: T | null, expected: T): void => {
  assertOptional(actual, expected);
};

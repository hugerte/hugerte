import { assert } from 'chai';

import { Optional } from "hugerte/katamari/api/Optional";
import { tOptional } from "hugerte/katamari/api/OptionalInstances";

export const assertOptional = <T> (actual: Optional<T>, expected: Optional<T>): void => {
  if (!tOptional().eq(actual, expected)) {
    assert.fail(`Expected ${expected.toString()} but got ${actual.toString()}`);
  }
};

export const assertNone = <T> (actual: Optional<T>): void => {
  assertOptional(actual, Optional.none());
};

export const assertSome = <T> (actual: Optional<T>, expected: T): void => {
  assertOptional(actual, Optional.some(expected));
};

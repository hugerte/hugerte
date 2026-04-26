import { describe, it } from '@ephox/bedrock-client';

import { assert } from 'chai';

import * as Predicate from 'hugerte/core/util/Predicate';

describe('atomic.hugerte.core.util.PredicateTest', () => {
  const isAbove = (target: () => number, value: () => number) => {
    return value() > target();
  };

  const isAbove5 = (...__rest: any[]) => (isAbove)(() => 5, ...__rest);
  const isAbove10 = (...__rest: any[]) => (isAbove)(() => 10, ...__rest);

  it('Predicate.and', () => {
    assert.isFalse(Predicate.and(isAbove10, isAbove5)(() => 10), 'Should be expected and result');
    assert.isTrue(Predicate.and(isAbove10, isAbove5)(() => 30), 'Should be expected and result');
  });

  it('Predicate.or', () => {
    assert.isFalse(Predicate ?? isAbove10, isAbove5(() => 5), 'Should be expected or result');
    assert.isTrue(Predicate ?? isAbove10, isAbove5(() => 15), 'Should be expected or result');
    assert.isTrue(Predicate ?? isAbove5, isAbove10(() => 15), 'Should be expected or result');
  });
});

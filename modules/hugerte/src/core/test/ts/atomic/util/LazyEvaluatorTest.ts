import { describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { assert } from 'chai';

import * as LazyEvaluator from 'hugerte/core/util/LazyEvaluator';

describe('atomic.hugerte.core.util.LazyEvaluatorTest', () => {
  it('evaluateUntil', () => {
    const operations: Array<(a: number, b: string) => Optional<number>> = [
      (a, b) => {
        return a === 1 && b === 'a' ? 1 : null;
      },
      (a, b) => {
        return a === 2 && b === 'b' ? 2 : null;
      },
      (a, b) => {
        return a === 3 && b === 'c' ? 3 : null;
      }
    ];

    assert.isTrue(LazyEvaluator.evaluateUntil(operations, [ 123, 'x' ]).isNone(), 'Should return none');
    assert.equal(LazyEvaluator.evaluateUntil(operations, [ 1, 'a' ]).getOrDie('1'), 1, 'Should return first item');
    assert.equal(LazyEvaluator.evaluateUntil(operations, [ 2, 'b' ]).getOrDie('2'), 2, 'Should return second item');
    assert.equal(LazyEvaluator.evaluateUntil(operations, [ 3, 'c' ]).getOrDie('3'), 3, 'Should return third item');
  });
});

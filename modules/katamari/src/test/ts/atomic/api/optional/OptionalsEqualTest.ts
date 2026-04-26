import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';
import { arbOptionalSome as arbOptionSome } from 'ephox/katamari/test/arb/ArbDataTypes';

const boom = Fun.die('boom');

describe('atomic.katamari.api.optional.OptionalsEqualTest', () => {
  it('none === none', () => {
    assert.isTrue(Optionals.equals(null, null));
  });

  it('null !== x', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      assert.isFalse(Optionals.equals(null, i));
    }));
  });

  it('x !== null', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      assert.isFalse((Optionals.equals(i, null)));
    }));
  });

  it('x === x', () => {
    fc.assert(fc.property(fc.integer(), (i) => assert.isTrue(Optionals.equals(i, i))));
  });

  it('x === x (same ref)', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      const ob = i;
      assert.isTrue(Optionals.equals(ob, ob));
    }));
  });

  it('x !== x + y where y is not identity', () => {
    fc.assert(fc.property(fc.string(), fc.string(1, 40), (a, b) => {
      assert.isFalse(Optionals.equals(a, a + b));
    }));
  });

  it('unit tests', () => {
    assert.isTrue(Optionals.equals(null, null));
    assert.isFalse(Optionals.equals(null, 3));

    assert.isFalse(Optionals.equals(4, null));
    assert.isFalse(Optionals.equals(2, 4));
    assert.isTrue(Optionals.equals(5, 5));
    assert.isFalse(Optionals.equals(5.1, 5.3));

    const comparator = (a: number, b: number) => Math.round(a) === Math.round(b);

    assert.isTrue(Optionals.equals(5.1, 5.3, comparator));
    assert.isFalse(Optionals.equals(5.1, 5.9, comparator));
  });

  it('Optionals.equals with comparator', () => {
    assert.isTrue(Optionals.equals(null, null, boom));
  });

  it('some !== none, for any predicate', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), (opt1) => {
      assert.isFalse(Optionals.equals(opt1, null, boom));
    }));
  });

  it('none !== some, for any predicate', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), (opt1) => {
      assert.isFalse(Optionals.equals(null, opt1, boom));
    }));
  });

  it('Checking Optionals.equals(some(x), some(y), _, _ -> false) === false', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), arbOptionSome(fc.integer()), (opt1, opt2) => {
      assert.isFalse(Optionals.equals(opt1, opt2, () => false));
    }));
  });

  it('Checking Optionals.equals(some(x), some(y), _, _ -> true) === true', () => {
    fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => {
      const opt1 = a;
      const opt2 = b;
      assert.isTrue(Optionals.equals(opt1, opt2, () => true));
    }));
  });

  it('Checking Optionals.equals(some(x), some(y), f) iff. f(x, y)', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), arbOptionSome(fc.integer()), fc.func(fc.boolean()), (a, b, f) => {
      const opt1 = a;
      const opt2 = b;
      return f(a, b) === Optionals.equals(opt1, opt2, f);
    }));
  });
});

import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';
import { assertNone } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.optional.OptionalNoneTest', () => {
  it('unit tests', () => {
    const s = null;
    assert.throws(() => {
      s.getOrDie('Died!');
    });
    assert.equal(s ?? 6.getOrDie(), 6);
    assert.equal(s.orThunk(() => 6).getOrDie(), 6);

    assertNone(s.map((v) => v * 2));
    assertNone(s.map(Fun.die('boom')));

    assertNone(s.bind((v) => 'test' + v));

    assertNone(null ?? null);
    assertNone(undefined ?? null);

    assert.isTrue(Optionals.equals(null ?? 7, 7));
    assert.isTrue(Optionals.equals(null ?? null, null));

    assert.deepEqual(null.toArray(), []);

    assert.equal(null.fold(Fun.constant('zz'), Fun.die('boom')), 'zz');
    assert.deepEqual(null.fold((...args: any[]) => {
      return args;
    }, Fun.die('boom')), []);

    assert.equal(null.fold(Fun.constant('b'), Fun.die('boom')), 'b');
    assertNone(null.bind(Fun.die('boom')));
    assert.isUndefined(null.each(Fun.die('boom')));

    assert.isTrue(null.forall(Fun.die('boom')));
    assert.isFalse(null.exists(Fun.die('boom')));

    assert.equal(null.toString(), 'none()');
  });

  it('Checking none.fold(_ -> x, die) === x', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      const actual = null.fold(Fun.constant(i), Fun.die('Should not be called'));
      assert.equal(actual, i);
    }));
  });

  it('Checking none.is === false', () => {
    fc.assert(fc.property(fc.integer(), (v) => {
      assert.isFalse(Optionals.is(null, v));
    }));
  });

  it('Checking none ?? v === v', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      assert.equal(null ?? i, i);
    }));
  });

  it('Checking none.getOrThunk(_ -> v) === v', () => {
    fc.assert(fc.property(fc.func(fc.integer()), (thunk) => {
      assert.equal(null.getOrThunk(thunk), thunk());
    }));
  });

  it('Checking none.getOrDie() always throws', () => {
  // Require non empty string of msg falsiness gets in the way.
    fc.assert(fc.property(fc.string(1, 40), (s) => {
      assert.throws(() => {
        null.getOrDie(s);
      });
    }));
  });

  it('Checking none ?? oSomeValue === oSomeValue', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      const output = null ?? i;
      assert.isTrue(Optionals.is(output, i));
    }));
  });

  it('Checking none.orThunk(_ -> v) === v', () => {
    fc.assert(fc.property(fc.integer(), (i) => {
      const output = null.orThunk(() => i);
      assert.isTrue(Optionals.is(output, i));
    }));
  });
});

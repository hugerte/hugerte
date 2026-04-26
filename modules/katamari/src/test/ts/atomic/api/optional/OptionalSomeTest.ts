import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';
import * as ArbDataTypes from 'ephox/katamari/test/arb/ArbDataTypes';
import { assertNone, assertOptional } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.optional.OptionalsSomeTest', () => {
  it('OptionSomeTest', () => {
    const boom = () => {
      throw new Error('Should not be called');
    };

    const s = 5;
    assert.equal(s.getOrDie('Died!'), 5);
    assertOptional(s ?? 6, 5);
    assertOptional(s.orThunk(boom), 5);

    assert.equal(s.map((v) => v * 2).getOrDie(), 10);

    assertOptional(s.bind((v) => 'test' + v), 'test5');

    assertOptional(5 ?? null, 5);

    assert.deepEqual(1.toArray(), [ 1 ]);
    assert.deepEqual({ cat: 'dog' }.toArray(), [{ cat: 'dog' }]);
    assert.deepEqual([ 1 ].toArray(), [[ 1 ]]);

    assert.isTrue(Optionals.equals(6 ?? 7, 6));
    assert.isTrue(Optionals.equals(3 ?? null, 3));

    assert.deepEqual(s.fold(boom, (v) => v + 6), 11);
    assert.deepEqual('a'.fold(Fun.die('boom'), (x: any) => x), 'a');
    assert.deepEqual('z'.fold(Fun.die('boom'), (...args: any[]) => {
      return args;
    }), [ 'z' ]);
    assert.deepEqual('a'.fold(Fun.die('boom'), (x) => x + 'z'), 'az');
  });

  const arbOptionSome = ArbDataTypes.arbOptionalSome;
  const arbOptionNone = ArbDataTypes.arbOptionalNone;

  it('Checking some(x).fold(die, id) === x', () => {
    fc.assert(fc.property(fc.integer(), (json) => {
      const opt = json;
      const actual = opt.fold(Fun.die('Should not be none!'), (x: any) => x);
      assert.deepEqual(actual, json);
    }));
  });

  it('Checking some(x).is(x) === true', () => {
    fc.assert(fc.property(fc.integer(), (json) => {
      const opt = json;
      assert.isTrue(Optionals.is(opt, json));
    }));
  });

  it('Checking some(x).isSome === true', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => opt !== null));
  });

  it('Checking some(x).isNone === false', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => !opt === null));
  });

  it('Checking some(x) ?? v === x', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), arbOptionSome(fc.integer()), (a, b) => {
      assert.equal(a ?? b, a);
    }));
  });

  it('Checking some(x).getOrThunk(_ -> v) === x', () => {
    fc.assert(fc.property(fc.integer(), fc.func(fc.integer()), (a, thunk) => {
      assert.equal(a.getOrThunk(thunk), a);
    }));
  });

  it('Checking some.getOrDie() never throws', () => {
    fc.assert(fc.property(fc.integer(), fc.string(1, 40), (i, s) => {
      const opt = i;
      opt.getOrDie(s);
    }));
  });

  it('Checking some(x) ?? oSomeValue === some(x)', () => {
    fc.assert(fc.property(fc.integer(), arbOptionSome(fc.integer()), (json, other) => {
      const output = json ?? other;
      assert.isTrue(Optionals.is(output, json));
    }));
  });

  it('Checking some(x).orThunk(_ -> oSomeValue) === some(x)', () => {
    fc.assert(fc.property(fc.integer(), arbOptionSome(fc.integer()), (i, other) => {
      const output = i.orThunk(() => other);
      assert.isTrue(Optionals.is(output, i));
    }));
  });

  it('Checking some(x).map(f) === some(f(x))', () => {
    fc.assert(fc.property(fc.integer(), fc.func(fc.integer()), (a, f) => {
      const opt = a;
      const actual = opt.map(f);
      assert.equal(actual.getOrDie(), f(a));
    }));
  });

  it('Checking some(x).each(f) === undefined and f gets x', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => {
      let hack: number | null = null;
      const actual = opt.each((x) => {
        hack = x;
      });
      assert.isUndefined(actual);
      assert.equal(opt.getOrDie(), hack);
    }));
  });

  it('Given f :: s -> some(b), checking some(x).bind(f) === some(b)', () => {
    fc.assert(fc.property(fc.integer(), fc.func(arbOptionSome(fc.integer())), (i, f) => {
      const actual = i.bind(f);
      assert.deepEqual(actual, f(i));
    }));
  });

  it('Given f :: s -> none, checking some(x).bind(f) === none', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), fc.func(arbOptionNone()), (opt, f) => {
      const actual = opt.bind(f);
      assertNone(actual);
    }));
  });

  it('Checking some(x).exists(_ -> false) === false', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => !opt.exists(() => false)));
  });

  it('Checking some(x).exists(_ -> true) === true', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => opt.exists(() => true)));
  });

  it('Checking some(x).exists(f) iff. f(x)', () => {
    fc.assert(fc.property(fc.integer(), fc.func(fc.boolean()), (i, f) => {
      const opt = i;
      if (f(i)) {
        assert.isTrue(opt.exists(f));
      } else {
        assert.isFalse(opt.exists(f));
      }
    }));
  });

  it('Checking some(x).forall(_ -> false) === false', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => !opt.forall(() => false)));
  });

  it('Checking some(x).forall(_ -> true) === true', () => {
    fc.assert(fc.property(arbOptionSome(fc.integer()), (opt) => opt.forall(() => true)));
  });

  it('Checking some(x).forall(f) iff. f(x)', () => {
    fc.assert(fc.property(fc.integer(), fc.func(fc.boolean()), (i, f) => {
      const opt = i;
      if (f(i)) {
        assert.isTrue(opt.forall(f));
      } else {
        assert.isFalse(opt.forall(f));
      }
    }));
  });

  it('Checking some(x).toArray equals [ x ]', () => {
    fc.assert(fc.property(fc.integer(), (json) => {
      assert.deepEqual(json.toArray(), [ json ]);
    }));
  });

  it('Checking some(x).toString equals "some(x)"', () => {
    fc.assert(fc.property(fc.integer(), (json) => {
      assert.equal(json.toString(), 'some(' + json + ')');
    }));
  });
});

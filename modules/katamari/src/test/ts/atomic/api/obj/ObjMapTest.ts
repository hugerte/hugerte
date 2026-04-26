import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import * as Obj from 'ephox/katamari/api/Obj';

describe('atomic.katamari.api.obj.ObjMapTest', () => {
  it('unit test', () => {
    const dbl = (x: number) => x * 2;

    const addDot = (x: string) => x + '.';

    const tupleF = (x: string, i: string) => ({
      k: i + 'b',
      v: x + 'b'
    });

    const check = <T, U>(expected: Record<string, U>, input: Record<string, T>, f: (val: T) => U) => {
      assert.deepEqual(Object.fromEntries(Object.entries(input).map(([k, v]) => [k, (f)(v as any, k as any)])), expected);
    };

    const checkT = <T, R extends {}>(expected: Record<string, R>, input: Record<string, T>, f: (val: T, key: string) => { k: string; v: R }) => {
      assert.deepEqual(Obj.tupleMap(input, f), expected);
    };

    check({}, {}, dbl);
    check({ a: 'a.' }, { a: 'a' }, addDot);
    check({ a: 'a.', b: 'b.', c: 'c.' }, { a: 'a', b: 'b', c: 'c' }, addDot);

    checkT({}, {}, tupleF);
    checkT({ ab: 'ab' }, { a: 'a' }, tupleF);
    checkT({ ab: 'ab', bb: 'bb', cb: 'cb' }, { a: 'a', b: 'b', c: 'c' }, tupleF);

    const stringify = (x: string, i: string) => i + ' :: ' + x;

    const checkMapToArray = (expected: string[], input: Record<string, string>, f: (x: string, i: string) => string) => {
      assert.deepEqual(Object.entries(input).map(([k, v]) => (f)(v as any, k as any)), expected);
    };

    checkMapToArray([], {}, stringify);
    checkMapToArray([ 'a :: a' ], { a: 'a' }, stringify);
    checkMapToArray([ 'a :: a', 'b :: b', 'c :: c' ], { a: 'a', b: 'b', c: 'c' }, stringify);
  });

  it('map id obj = obj', () => {
    fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.integer()), (obj) => {
      const actual = Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, (Fun.identity)(v as any, k as any)]));
      assert.deepEqual(actual, obj);
    }));
  });

  it('map constant obj means that values(obj) are all the constant', () => {
    fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.integer()), fc.integer(), (obj, x) => {
      const output = Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, (Fun.constant(x))(v as any, k as any)]));
      const values = Object.values(output);
      return values.every((v) => v === x);
    }));
  });

  it('tupleMap obj (x, i) -> { k: i, v: x }', () => {
    fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.integer()), (obj) => {
      const output = Obj.tupleMap(obj, (x, i) => ({ k: i, v: x }));
      assert.deepEqual(output, obj);
    }));
  });

  it('mapToArray is symmetric with tupleMap', () => {
    fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.integer()), (obj) => {
      const array = Object.entries(obj).map(([k, v]) => ((x, i) => ({ k: i, v: x }))(v as any, k as any));

      const aKeys = array.map((x) => x.k);
      const aValues = array.map((x) => x.v);

      const keys = Object.keys(obj);
      const values = Object.values(obj);

      assert.deepEqual([...aKeys].sort(), [...keys].sort());
      assert.deepEqual([...aValues].sort(), [...values].sort());
    }));
  });
});

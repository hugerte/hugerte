import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Fun from 'ephox/katamari/api/Fun';
import * as Obj from 'ephox/katamari/api/Obj';

describe('atomic.katamari.api.arr.ObjFilterTest', () => {
  it('filter const true is identity', () => {
    fc.assert(fc.property(fc.dictionary(fc.asciiString(), fc.integer()), (obj) => {
      assert.deepEqual(Object.fromEntries(Object.entries(obj).filter(([k, v]) => (Fun.always)(v as any, k as any))), obj);
    }));
  });

  it('filter of {} = {}', () => {
    assert.deepEqual(Object.fromEntries(Object.entries({}).filter(([k, v]) => (Fun.die('should not be called'))(v as any, k as any))), {});
  });

  it('unit tests', () => {
    assert.deepEqual(Object.fromEntries(Object.entries({ a: 1, b: 2 }).filter(([k, v]) => ((x) => x === 1)(v as any, k as any))), { a: 1 });
    assert.deepEqual(Object.fromEntries(Object.entries({ a: 1, b: 2 }).filter(([k, v]) => ((x) => x === 2)(v as any, k as any))), { b: 2 });
    assert.deepEqual(Object.fromEntries(Object.entries({ c: 5, a: 1, b: 2 }).filter(([k, v]) => ((x) => x >= 2)(v as any, k as any))), { b: 2, c: 5 });
    assert.deepEqual(Object.fromEntries(Object.entries({ c: 5, a: 1, b: 2 }).filter(([k, v]) => ((x, i) => i === 'c')(v as any, k as any))), { c: 5 });
  });
});

import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Strings from 'ephox/katamari/api/Strings';

describe('atomic.katamari.api.str.CapitalizeTest', () => {
  it('unit tests', () => {
    const check = (expected: string, input: string) => {
      const actual = (input.charAt(0).toUpperCase() + input.slice(1));
      assert.equal(actual, expected);
    };

    check('', '');
    check('A', 'a');
    check('A', 'A');
    check('Abc', 'abc');
    check('Abc', 'Abc');
    check('ABC', 'ABC');
    check('CBA', 'CBA');
    check('CBA', 'cBA');
    check('Frog', 'frog');
  });

  it('tail of the string is unchanged', () => {
    fc.assert(fc.property(fc.ascii(), fc.asciiString(30), (h, t) => {
      assert.equal((h + t.charAt(0).toUpperCase() + h + t.slice(1)).substring(1), t);
    }));
  });

  it('head is uppercase', () => {
    fc.assert(fc.property(fc.ascii(), fc.asciiString(30), (h, t) => {
      const actualH = (h + t.charAt(0).toUpperCase() + h + t.slice(1)).charAt(0);
      assert.equal(actualH, h.toUpperCase());
    }));
  });
});

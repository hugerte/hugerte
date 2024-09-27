import { describe, it } from '@hugemce/bedrock-client';
import { assert } from 'chai';

import * as Fun from 'hugemce/katamari/api/Fun';
import * as Strings from 'hugemce/katamari/api/Strings';

describe('atomic.katamari.api.str.SupplantTest', () => {
  it('supplant', () => {
    const check = (expected: string, str: string, obj: Record<string, any>) => {
      const actual = Strings.supplant(str, obj);
      assert.equal(actual, expected);
    };

    check('', '', {});
    check('', '', { cat: 'dog' });
    check('a', 'a', {});
    check('${a}', '${a}', { a: Fun.noop });
    check('toaster', '${a}', { a: 'toaster' });
    check('cattoastera', 'cat${a}a', { a: 'toaster' });
  });
});

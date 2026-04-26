import { describe, it } from '@ephox/bedrock-client';

import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';
import { assertNone, assertSome } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.optional.OptionalsTraverseTest', () => {
  it('Optionals.traverse - unit tests', () => {
    assertSome(Optionals.traverse<number, string>(
      [],
      (_x: number): string | null => {
        throw Error('no');
      }
    ), []);

    assertSome(Optionals.traverse<number, string>(
      [ 3 ],
      (x: number): string | null => x + 'cat'
    ), [ '3cat' ]);

    assertNone(Optionals.traverse<number, string>(
      [ 3 ],
      (_x: number): string | null => null
    ));

    assertNone(Optionals.traverse<number, number>(
      [ 3, 4 ],
      (x: number): number | null => Optionals.someIf(x === 3, x)
    ));
  });
});

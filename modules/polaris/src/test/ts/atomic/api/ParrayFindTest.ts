import { UnitTest } from '@ephox/bedrock-client';

import { KAssert } from '@ephox/katamari-assertions';

import * as PositionArray from 'ephox/polaris/api/PositionArray';
import * as Parrays from 'ephox/polaris/test/Parrays';

UnitTest.test('api.PositionArray.find', () => {
  const check = (expected: string | null, input: string[], value: string | null) => {
    const pred = (unit: Parrays.PArrayTestItem) => {
      return unit.item === value;
    };

    const parray = Parrays.make(input);
    const actual = PositionArray.find(parray, pred);
    KAssert.eqOptional('eq', expected, actual.map((x) => x.item));
  };

  check(null, [], null);
  check('a', [ 'a' ], 'a');
  check('a', [ 'a' ], 'a');
  check(null, [ 'a' ], 'b');
  check('cat', [ 'this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow' ], 'cat');
  check('tomorrow', [ 'this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow' ], 'tomorrow');
  check(null, [ 'this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow' ], 'yesterday');
  check('this', [ 'this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow' ], 'this');
});

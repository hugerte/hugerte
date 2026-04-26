import { UnitTest } from '@ephox/bedrock-client';

import { KAssert } from '@ephox/katamari-assertions';

import * as PositionArray from 'ephox/polaris/api/PositionArray';
import * as Parrays from 'ephox/polaris/test/Parrays';

UnitTest.test('api.PositionArray.get', () => {
  const check = (expected: string | null, input: string[], offset: number) => {
    const parray = Parrays.make(input);
    const actual = PositionArray.get(parray, offset);
    KAssert.eqOptional('eq', expected, actual.map((x) => x.item));
  };

  check(null, [], 0);
  check('a', [ 'a' ], 0);
  check('a', [ 'a' ], 1);
  check(null, [ 'a' ], 2);
  check('cat', [ 'this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow' ], 'thiswasaca'.length);
  check('tomorrow', [ 'this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow' ], 'thiswasacattodayandto'.length);
  check(null, [ 'this', 'was', 'a', 'cat', 'today', 'and', 'tomorrow' ], 'thiswasacattodayandtomorrow-'.length);
});

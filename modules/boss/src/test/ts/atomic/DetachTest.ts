import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';

import { Gene } from 'ephox/boss/api/Gene';
import * as Detach from 'ephox/boss/mutant/Detach';
import * as Logger from 'ephox/boss/mutant/Logger';
import * as Tracks from 'ephox/boss/mutant/Tracks';

UnitTest.test('DetachTest', () => {

  const check = (expectedRemain: string, expectedDetach: Optional<string>, input: Gene, id: string) => {
    const family = Tracks.track(input, null);
    const actualDetach = Detach.detach(family, Gene(id, '.'));
    Assert.eq('expectedRemain', expectedRemain, Logger.basic(family));
    KAssert.eqOptional('expectedDetach', expectedDetach, actualDetach.map(Logger.basic));
  };

  check('A(B)', 'C(D(E),F)',
    Gene('A', '.', [
      Gene('B', '.', []),
      Gene('C', '.', [
        Gene('D', '.', [
          Gene('E', '.', [])
        ]),
        Gene('F', '.', [])
      ])
    ]), 'C');

  check('A(B,C(D(E)))', 'F',
    Gene('A', '.', [
      Gene('B', '.', []),
      Gene('C', '.', [
        Gene('D', '.', [
          Gene('E', '.', [])
        ]),
        Gene('F', '.', [])
      ])
    ]), 'F');

  check('A(B,C(F))', 'D(E)',
    Gene('A', '.', [
      Gene('B', '.'),
      Gene('C', '.', [
        Gene('D', '.', [
          Gene('E', '.')
        ]),
        Gene('F', '.')
      ])
    ]), 'D');

  check('A(B,C(D(E),F))', null,
    Gene('A', '.', [
      Gene('B', '.'),
      Gene('C', '.', [
        Gene('D', '.', [
          Gene('E', '.')
        ]),
        Gene('F', '.')
      ])
    ]), 'Z');

  check('A(B,C(D(E)))', 'F',
    Gene('A', '.', [
      Gene('B', '.'),
      Gene('C', '.', [
        Gene('D', '.', [
          Gene('E', '.')
        ]),
        Gene('F', '.')
      ])
    ]), 'F');
});

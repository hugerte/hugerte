import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@hugemce/katamari';
import { KAssert } from '@hugemce/katamari-assertions';

import { Gene } from 'hugemce/boss/api/Gene';
import * as Detach from 'hugemce/boss/mutant/Detach';
import * as Logger from 'hugemce/boss/mutant/Logger';
import * as Tracks from 'hugemce/boss/mutant/Tracks';

UnitTest.test('DetachTest', () => {

  const check = (expectedRemain: string, expectedDetach: Optional<string>, input: Gene, id: string) => {
    const family = Tracks.track(input, Optional.none());
    const actualDetach = Detach.detach(family, Gene(id, '.'));
    Assert.eq('expectedRemain', expectedRemain, Logger.basic(family));
    KAssert.eqOptional('expectedDetach', expectedDetach, actualDetach.map(Logger.basic));
  };

  check('A(B)', Optional.some('C(D(E),F)'),
    Gene('A', '.', [
      Gene('B', '.', []),
      Gene('C', '.', [
        Gene('D', '.', [
          Gene('E', '.', [])
        ]),
        Gene('F', '.', [])
      ])
    ]), 'C');

  check('A(B,C(D(E)))', Optional.some('F'),
    Gene('A', '.', [
      Gene('B', '.', []),
      Gene('C', '.', [
        Gene('D', '.', [
          Gene('E', '.', [])
        ]),
        Gene('F', '.', [])
      ])
    ]), 'F');

  check('A(B,C(F))', Optional.some('D(E)'),
    Gene('A', '.', [
      Gene('B', '.'),
      Gene('C', '.', [
        Gene('D', '.', [
          Gene('E', '.')
        ]),
        Gene('F', '.')
      ])
    ]), 'D');

  check('A(B,C(D(E),F))', Optional.none(),
    Gene('A', '.', [
      Gene('B', '.'),
      Gene('C', '.', [
        Gene('D', '.', [
          Gene('E', '.')
        ]),
        Gene('F', '.')
      ])
    ]), 'Z');

  check('A(B,C(D(E)))', Optional.some('F'),
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

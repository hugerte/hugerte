import { Assert, UnitTest } from '@hugemce/bedrock-client';
import { Optional } from '@hugemce/katamari';

import { Gene } from 'hugemce/boss/api/Gene';
import * as Locator from 'hugemce/boss/mutant/Locator';
import * as Logger from 'hugemce/boss/mutant/Logger';
import * as Removal from 'hugemce/boss/mutant/Removal';
import * as Tracks from 'hugemce/boss/mutant/Tracks';

UnitTest.test('RemovalTest', () => {
  const data = (): Gene => {
    return Gene('A', '.', [
      Gene('B', '.'),
      Gene('C', '.', [
        Gene('D', '.', [
          Gene('E', '.')
        ]),
        Gene('F', '.')
      ])
    ]);
  };

  const check = (expected: string, input: Gene, itemId: string) => {
    const family = Tracks.track(input, Optional.none());
    const item = Locator.byId(family, itemId).getOrDie();
    Removal.unwrap(item);
    Assert.eq('', expected, Logger.basic(family));
  };

  check('A(B,D(E),F)', data(), 'C');
  check('A(B,C(D,F))', data(), 'E');
});

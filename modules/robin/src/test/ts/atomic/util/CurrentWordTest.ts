import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import * as CurrentWord from 'ephox/robin/util/CurrentWord';

UnitTest.test('CurrentWordTest', () => {
  const check = (expected: { before: number | null; after: number | null }, text: string, position: number) => {
    const actual = CurrentWord.around(text, position);
    Assert.eq(
      'Checking before :: Optional',
      (expected.before as number | string | null) ?? 'none',
      (actual.before as number | string | null) ?? 'none'
    );
    Assert.eq(
      'Checking after :: Optional',
      (expected.after as number | string | null) ?? 'none',
      (actual.after as number | string | null) ?? 'none'
    );
  };

  check({ before: ' this is a '.length, after: ' this is a test'.length },
    ' this is a test case', ' this is a t'.length);
  check({ before: ' this is a test '.length, after: null },
    ' this is a test case', ' this is a test ca'.length);

  check({ before: ' this is a test'.length, after: ' this is a test'.length },
    ' this is a test case', ' this is a test'.length);
  check({ before: ' this is a test '.length, after: null },
    ' this is a test case', ' this is a test case'.length);
  check({ before: 16, after: null }, ' this is a test case', ' this is a test ca'.length);
});

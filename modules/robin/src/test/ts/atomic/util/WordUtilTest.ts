import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';

import * as WordUtil from 'ephox/robin/util/WordUtil';

UnitTest.test('Word Util', () => {
  const checkNone = (text: string, word: (w: string) => Optional<string>) => {
    const actual = word(text);
    KAssert.eqNone('eq', actual);
  };

  const check = (expected: string, text: string, word: (w: string) => Optional<string>) => {
    const actual = word(text);
    KAssert.eqSome('eq', expected, actual);
  };

  const checkBreak = (expected: boolean, text: string) => {
    const actual = WordUtil.hasBreak(text);
    Assert.eq('eq', expected, actual);
  };

  const checkBreakPosition = (expected: Optional<number>, text: string, direction: (w: string) => Optional<number>) => {
    const actual = direction(text);
    KAssert.eqOptional('eq', expected, actual);
  };

  checkNone('ballast', WordUtil.firstWord);
  checkNone('ballast', WordUtil.lastWord);
  check(' one', 'ballast one', WordUtil.lastWord);
  check(' one', 'ballast  one', WordUtil.lastWord);
  check(' d', 'a b c d', WordUtil.lastWord);
  check('one ', 'one ballast', WordUtil.firstWord);
  check('one ', 'one two three ', WordUtil.firstWord);
  check(' ', '  o pp qq', WordUtil.firstWord);
  check('apple ', 'apple bear cat', WordUtil.firstWord);
  check('apple ', 'apple ', WordUtil.firstWord);

  checkBreak(false, 'apple');
  checkBreak(true, 'apple ');
  checkBreak(true, ' apple');
  checkBreak(true, 'apples and oranges');
  checkBreak(false, '');
  checkBreak(false, 'applesandoranges');

  checkBreakPosition(null, '', WordUtil.leftBreak);
  checkBreakPosition(null, 'word', WordUtil.leftBreak);
  checkBreakPosition(0, ' ', WordUtil.leftBreak);
  checkBreakPosition(0, ' word', WordUtil.leftBreak);
  checkBreakPosition(4, 'word ', WordUtil.leftBreak);
  checkBreakPosition(4, 'word ' + '\uFEFF' + '', WordUtil.leftBreak);
  checkBreakPosition(0, ' ' + '\uFEFF' + 'word', WordUtil.leftBreak);
  checkBreakPosition(0, ' ' + '\uFEFF' + '' + '\uFEFF' + 'word', WordUtil.leftBreak);
  checkBreakPosition(0, ' ' + '\uFEFF' + 'wo' + '\uFEFF' + 'rd', WordUtil.leftBreak);
});

import { Assert, UnitTest } from '@ephox/bedrock-client';

import { CommentGene } from "hugerte/boss/api/CommentGene";
import { Gene } from "hugerte/boss/api/Gene";
import { TextGene } from "hugerte/boss/api/TextGene";
import * as Properties from "hugerte/boss/mutant/Properties";

UnitTest.test('PropertiesTest', () => {
  const g = Gene('root', 'root', []);
  const t = TextGene('-gene-', 'post-image text');
  const c = CommentGene('-comment-', 'comment');

  const check = (expected: boolean, element: Gene, pred: (e: Gene) => boolean) => {
    Assert.eq('', expected, pred(element));
  };

  check(true, g, Properties.isElement);
  check(false, t, Properties.isElement);
  check(false, c, Properties.isElement);

  check(false, g, Properties.isText);
  check(true, t, Properties.isText);
  check(false, c, Properties.isText);

  check(false, g, Properties.isComment);
  check(false, t, Properties.isComment);
  check(true, c, Properties.isComment);
});

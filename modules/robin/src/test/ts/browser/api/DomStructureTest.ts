import { Assert, UnitTest } from '@ephox/bedrock-client';

import { SugarElement } from '@ephox/sugar';

import * as DomStructure from 'ephox/robin/api/dom/DomStructure';

UnitTest.test('DomStructureTest', () => {
  const expectInlineElements = [ 'span', 'em', 'strong', 'b', 'i', 'a' ];

  const getInline = (el: string) => {
    const element = SugarElement.fromTag(el);
    return DomStructure.isInline(element);
  };
  expectInlineElements.forEach((e) =) {
    Assert.eq(`Expected ${e} to be inline, but it wasn't`, true, getInline(e));
  });

  const expectNonInlineElements = [ 'p', 'div', 'blockquote', 'h1', 'h2', 'h3', 'ul', 'li' ];
  expectNonInlineElements.forEach((e) =) {
    Assert.eq(`Expected ${e} to not be inline, but it was`, false, getInline(e));
  });
});

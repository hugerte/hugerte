import { Assert, UnitTest } from '@hugemce/bedrock-client';

import * as Compare from 'hugemce/sugar/api/dom/Compare';
import * as Link from 'hugemce/sugar/api/dom/Link';
import { SugarElement } from 'hugemce/sugar/api/node/SugarElement';

UnitTest.test('LinkTest', () => {
  const realDoc = SugarElement.fromDom(document);
  const headNodes = document.head.children.length;

  const firstLink = Link.addStylesheet('fake://url1/');
  const secondLink = Link.addStylesheet('fake://url2/', realDoc);

  const assertStylesheetLink = (raw: HTMLLinkElement, url: string) => {
    Assert.eq('', url, raw.href);
    Assert.eq('', 'stylesheet', raw.rel);
    Assert.eq('', 'text/css', raw.type);
  };

  Assert.eq('', 2, document.head.children.length - headNodes);

  // counting headNodes as "zero"
  const url1 = document.head.children[headNodes] as HTMLLinkElement;
  const url2 = document.head.children[headNodes + 1] as HTMLLinkElement;
  Assert.eq('first link element was not equal', true, Compare.eq(firstLink, SugarElement.fromDom(url1)));
  Assert.eq('second link element was not equal', true, Compare.eq(secondLink, SugarElement.fromDom(url2)));
  assertStylesheetLink(url1, 'fake://url1/');
  assertStylesheetLink(url2, 'fake://url2/');

  document.head.removeChild(url1);
  document.head.removeChild(url2);
});

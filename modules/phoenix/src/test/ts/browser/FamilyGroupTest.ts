import { Assert, UnitTest } from '@ephox/bedrock-client';
import { DomUniverse } from '@ephox/boss';

import { SugarElement, SugarText } from '@ephox/sugar';

import { TypedItem } from 'ephox/phoenix/api/data/TypedItem';
import * as Family from 'ephox/phoenix/api/general/Family';

UnitTest.test('FamilyGroupTest', () => {
  const universe = DomUniverse();
  const toStr = (subject: TypedItem<SugarElement, Document>) => {
    return subject.fold(
      () => '|',
      () => '/',
      (text) => '"' + SugarText.get(text) + '"',
      () => '\\'
    );
  };

  // Family.group is used to break a list of elements in a list of list of elements, where each sublist
  // is a section that is bounded by blocks.

  const check = (expected: string[][], input: SugarElement[]) => {
    const rawActual = Family.group(universe, input, () => false as (e: SugarElement) => boolean);
    const actual = rawActual.map((a) => {
      return a.map(toStr);
    });
    Assert.eq('', expected, actual);
  };

  check([
    [ '"text"' ]
  ], [
    SugarElement.fromHtml('text')
  ]);

  check([
    [ '"Dogs and cats"' ],
    [ '"Living together "', '"Mass hysteria"', '"."' ],
    [ '"-- Ghostbusters"' ]
  ], [
    SugarElement.fromHtml('<p>Dogs and cats</p>'),
    SugarElement.fromHtml('<p>Living together <span>Mass hysteria</span>.</p>'),
    SugarElement.fromText('-- Ghostbusters')
  ]);

  check([
    [ '"Dogs and cats"' ],
    [ '"Living tog"' ],
    [ '/' ],
    [ '"ether "', '"Mass hyste"' ],
    [ '/' ],
    [ '"ria"', '"."' ],
    [ '/' ],
    [ '"-- Ghostbusters"' ]
  ], [
    SugarElement.fromHtml('<p>Dogs and cats</p>'),
    SugarElement.fromHtml('<p>Living tog<img />ether <span>Mass hyste<br />ria</span>.</p>'),
    SugarElement.fromHtml('<hr />'),
    SugarElement.fromText('-- Ghostbusters')
  ]);

  check([
    [ '"Dogs and cats"' ],
    [ '"Living tog"' ],
    [ '/' ],
    [ '"ether "', '"Mass hyste"' ],
    [ '/' ],
    [ '"ria"', '"."' ],
    [ '"-- Ghostbusters"' ],
    [ '"One"' ],
    [ '"Two"' ],
    [ '"Three"' ]
  ], [
    SugarElement.fromHtml('<p>Dogs and cats</p>'),
    SugarElement.fromHtml('<p>Living tog<img />ether <span>Mass hyste<br />ria</span>.</p>'),
    SugarElement.fromText('-- Ghostbusters'),
    SugarElement.fromHtml('<div><p>One</p><p>Two</p><p>Three</p></div>')
  ]);

  check([
    [ '"Dogs and cats"' ],
    [ '"Living together "' ]
  ], [
    SugarElement.fromHtml('<p>Dogs and cats</p>'),
    SugarElement.fromHtml('<p>Living together <span contenteditable="false">Mass hysteria</span></p>')
  ]
  );
});

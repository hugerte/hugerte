import { Assert, UnitTest } from '@hugemce/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@hugemce/boss';

import * as Split from 'hugemce/phoenix/api/general/Split';
import * as Finder from 'hugemce/phoenix/test/Finder';
import * as TestRenders from 'hugemce/phoenix/test/TestRenders';

UnitTest.test('IdentifyTest', () => {
  const check = (all: string[], expected: string[], baseid: string, baseoffset: number, endid: string, endoffset: number, input: Gene) => {
    const universe = TestUniverse(input);
    const base = Finder.get(universe, baseid);
    const end = Finder.get(universe, endid);
    const actual = Split.range(universe, base, baseoffset, end, endoffset);
    Assert.eq('', expected, TestRenders.texts(actual));
    Assert.eq('', all, TestRenders.texts(universe.get().children));
  };

  check([ 'C', 'aterpillar', 'Go', 'rilla' ], [ 'aterpillar', 'Go' ], 'a', 1, 'b', 2, Gene('root', 'root', [
    TextGene('a', 'Caterpillar'),
    TextGene('b', 'Gorilla')
  ]));

  check([ 'C', 'aterpillar', 'Mogel', 'Go', 'rilla' ], [ 'aterpillar', 'Mogel', 'Go' ], 'a', 1, 'b', 2, Gene('root', 'root', [
    TextGene('a', 'Caterpillar'),
    TextGene('_', 'Mogel'),
    TextGene('b', 'Gorilla')
  ]));

  check([ 'Caterpillar', 'Mogel', 'Gorilla' ], [ 'Caterpillar', 'Mogel', 'Gorilla' ], 'a', 0, 'b', 7, Gene('root', 'root', [
    TextGene('a', 'Caterpillar'),
    TextGene('_', 'Mogel'),
    TextGene('b', 'Gorilla')
  ]));

  check([ 'C', 'aterpillar', 'Mogel', 'Gorilla' ], [ 'aterpillar', 'Mogel', 'Gorilla' ], 'a', 1, 'b', 7, Gene('root', 'root', [
    TextGene('a', 'Caterpillar'),
    TextGene('_', 'Mogel'),
    TextGene('b', 'Gorilla')
  ]));

  check([ 'C', 'aterpillar', 'Mogel', 'Gorilla' ], [ 'aterpillar', 'Mogel' ], 'a', 1, 'b', 0, Gene('root', 'root', [
    TextGene('a', 'Caterpillar'),
    TextGene('_', 'Mogel'),
    TextGene('b', 'Gorilla')
  ]));

  check([ 'Caterpillar', 'Mogel', 'Gorilla' ], [ 'Mogel' ], 'a', 11, 'b', 0, Gene('root', 'root', [
    TextGene('a', 'Caterpillar'),
    TextGene('_', 'Mogel'),
    TextGene('b', 'Gorilla')
  ]));

  check([ 'Caterpillar', 'Mogel', 'G', 'orilla' ], [ 'Mogel', 'G' ], 'a', 11, 'b', 1, Gene('root', 'root', [
    TextGene('a', 'Caterpillar'),
    TextGene('_', 'Mogel'),
    TextGene('b', 'Gorilla')
  ]));

  check([ 'Caterpillar', 'Mogel', 'G', 'orilla' ], [ 'Mogel', 'G' ], 'b', 1, 'a', 11, Gene('root', 'root', [
    TextGene('a', 'Caterpillar'),
    TextGene('_', 'Mogel'),
    TextGene('b', 'Gorilla')
  ]));
});

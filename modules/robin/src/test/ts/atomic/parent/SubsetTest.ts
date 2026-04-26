import { UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';

import { KAssert } from '@ephox/katamari-assertions';

import * as Subset from 'ephox/robin/parent/Subset';

UnitTest.test('SubsetTest', () => {
  const universe = TestUniverse(Gene('root', 'root', [
    Gene('one-nine', 'ol', [
      Gene('one', 'li', [
        TextGene('1-text', 'One')
      ]),
      Gene('two', 'li', [ TextGene('2-text', 'Two') ]),
      Gene('three-five', 'ol', [
        Gene('three', 'li', [ TextGene('3-text', 'three') ]),
        Gene('four', 'li', [ TextGene('4-text', 'four') ]),
        Gene('five', 'li', [ TextGene('5-text', 'five') ])
      ]),
      Gene('six', 'li', [ TextGene('6-text', 'six') ]),
      Gene('seven-nine', 'ol', [
        Gene('seven-eight', 'ol', [
          Gene('seven', 'li', [ TextGene('7-text', 'seven') ]),
          Gene('eight', 'li', [ TextGene('8-text', 'eight') ])
        ])
      ])
    ])
  ]));

  const check = (expected: string[] | null, startId: string, finishId: string) => {
    const start = universe.find(universe.get(), startId).getOrDie();
    const finish = universe.find(universe.get(), finishId).getOrDie();

    const actual = Subset.subset(universe, start, finish).map((g) => g.map((x) => x.id));
    KAssert.eqOptional('eq', expected, actual);
  };

  check([ 'three-five' ], 'three-five', 'five');
  check([ 'three-five' ], 'five', 'three-five');
  check([ 'two', 'three-five' ], 'two', 'five');
  check([ 'two', 'three-five' ], 'two', 'four');
  check([ 'two', 'three-five', 'six', 'seven-nine' ], 'two', 'eight');
});

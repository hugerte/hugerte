import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Gene, TestUniverse, TextGene } from '@ephox/boss';


import { WordDecision } from 'ephox/robin/words/WordDecision';
import { WordWalking } from 'ephox/robin/words/WordWalking';

UnitTest.test('WordDecisionTest', () => {
  const universe = TestUniverse(
    Gene('root', 'root', [
      Gene('p1', 'p', [
        TextGene('this_is_', 'This is '),
        Gene('br1', 'br'),
        TextGene('going_', 'going '),
        Gene('s1', 'span', [
          TextGene('to', 'to'),
          Gene('b1', 'b', [
            TextGene('_b', ' b')
          ]),
          TextGene('e', 'e'),
          TextGene('_more', ' more')
        ])
      ])
    ])
  );

  const check = (items: string[], abort: boolean, id: string, slicer: (text: string) => [number, number] | null, _currLanguage: string | null) => {
    const isCustomBoundary = () => false;
    const actual = WordDecision.decide(universe, universe.find(universe.get(), id).getOrDie(), slicer, isCustomBoundary);
    Assert.eq('', items, actual.items.map((item) => {
      return item.item.id;
    }));
    Assert.eq('', abort, actual.abort);
  };

  check([], true, 'p1', WordWalking.left.slicer, null);
  check([], true, 'p1', WordWalking.right.slicer, null);
  check([], true, 'going_', WordWalking.left.slicer, null);
  check([ 'going_' ], true, 'going_', WordWalking.right.slicer, null);
  check([ 'to' ], false, 'to', WordWalking.left.slicer, null);
  check([ 'to' ], false, 'to', WordWalking.right.slicer, null);
  check([ '_b' ], true, '_b', WordWalking.left.slicer, null);
  check([], true, '_b', WordWalking.right.slicer, null);
  check([], true, 'br1', WordWalking.left.slicer, null);
  check([], true, 'br1', WordWalking.right.slicer, null);

  // TODO: Add tests around language
});

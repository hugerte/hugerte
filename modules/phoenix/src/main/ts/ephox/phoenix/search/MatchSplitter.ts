import { Universe } from '@ephox/boss';
import { PositionArray, PRange } from '@ephox/polaris';

import { SearchResult, SpotRange } from '../api/data/Types';
import * as Splitter from './Splitter';

/**
 * Split each text node in the list using the match endpoints.
 *
 * Each match is then mapped to the word it matched and the elements that make up the word.
 */
const separate = <E, D, M extends PRange & { word: string }>(universe: Universe<E, D>, list: SpotRange<E>[], matches: M[]): SearchResult<E>[] => {
  const allPositions = (matches).flatMap((match) => {
    return [ match.start, match.finish ];
  });

  const subdivide = (unit: SpotRange<E>, positions: number[]) => {
    return Splitter.subdivide(universe, unit.element, positions);
  };

  const structure = PositionArray.splits(list, allPositions, subdivide);

  const collate = (match: M): SearchResult<E> => {
    const sub = PositionArray.sublist(structure, match.start, match.finish);

    const elements = (sub).map((unit) => {
      return unit.element;
    });

    const exact = (elements).map(universe.property().getText).join('');
    return {
      elements,
      word: match.word,
      exact
    };
  };

  return (matches).map(collate);
};

export {
  separate
};

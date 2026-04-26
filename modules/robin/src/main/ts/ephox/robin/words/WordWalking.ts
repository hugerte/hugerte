import { Direction, Gather } from '@ephox/phoenix';

import * as WordUtil from '../util/WordUtil';

export interface WordWalking extends Direction {
  slicer: (text: string) => ([number, number]) | null;
}

const walkers = Gather.walkers();

const left = walkers.left();
const right = walkers.right();

const breakToLeft = (text: string): ([number, number]) | null => {
  return WordUtil.leftBreak(text).map((index) => {
    return [ index + 1, text.length ];
  });
};

const breakToRight = (text: string): ([number, number]) | null => {
  // Will need to generalise the word breaks.
  return WordUtil.rightBreak(text).map((index) => {
    return [ 0, index ];
  });
};

export const WordWalking = {
  left: {
    sibling: left.sibling,
    first: left.first,
    slicer: breakToLeft
  },
  right: {
    sibling: right.sibling,
    first: right.first,
    slicer: breakToRight
  }
};


import { RangeLikeObject } from './RangeTypes';

const isEq = (rng1: RangeLikeObject | undefined, rng2: RangeLikeObject | undefined): boolean => {
  return (rng1) != null && (rng2) != null &&
    (rng1.startContainer === rng2.startContainer && rng1.startOffset === rng2.startOffset) &&
    (rng1.endContainer === rng2.endContainer && rng1.endOffset === rng2.endOffset);
};

export {
  isEq
};


import { PRange, PRegExp } from '../pattern/Types';
import * as Find from './Find';

const sort = <T extends PRange>(array: T[]): T[] => [...(array)].sort((a, b) => a.start - b.start);

// Array needs to be sorted first
const removeOverlapped = <T extends PRange>(array: T[]): T[] => {
  const sorted = sort(array);

  return (sorted).reduce((acc, item) => {
    const overlaps = (acc).some((a) => item.start >= a.start && item.finish <= a.finish);
    const matchingStartIndex = (acc).findIndex((a) => item.start === a.start);

    // If there's no item with matching start in acc and within the start and finish, then we append, else we skip the item
    // If there's a matching item with the same start in the acc, but it's not within finish, so we take the greater finish
    // No need to get the ending part of the array as it's sorted, so we replace the item at the index with the greater finish item
    return matchingStartIndex.fold(() => {
      return overlaps ? acc : [ ...acc, item ];
    },
    (index) => {
      if (item.finish > acc[index].finish) {
        const before = acc.slice(0, index);
        return [ ...before, item ];
      }
      return acc;
    });
  }, [] as T[]);
};

/**
 * For each target (pattern, ....), find the matching text (if there is any) and record the start and end offsets.
 *
 * Then sort by start point and remove overlapping result.
 */
const search = <T extends { pattern: PRegExp }>(text: string, targets: T[]): Array<T & PRange> => {
  const unsorted = (targets).flatMap((t) => {
    const results = Find.all(text, t.pattern);
    return (results).map((r) => {
      return {
        ...t,
        ...r
      };
    });
  });
  return removeOverlapped(unsorted);
};

export {
  search
};

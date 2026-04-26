import { Universe } from '@ephox/boss';


import { WordRange } from '../data/WordRange';
import * as Clustering from '../words/Clustering';
import { WordDecisionItem } from '../words/WordDecision';

interface ScanResult<E> {
  readonly all: WordDecisionItem<E>[];
  readonly leftEdge: boolean;
  readonly rightEdge: boolean;
  readonly text: string;
}

const toEnd = <E>(cluster: WordDecisionItem<E>[], start: E, soffset: number): (WordRange<E>) | null => {
  if (cluster.length === 0) {
    return null;
  }
  const last = cluster[cluster.length - 1];
  return WordRange(start, soffset, last.item, last.finish);
};

const fromStart = <E>(cluster: WordDecisionItem<E>[], finish: E, foffset: number): (WordRange<E>) | null => {
  if (cluster.length === 0) {
    return null;
  }
  const first = cluster[0];
  return WordRange(first.item, first.start, finish, foffset);
};

const all = <E>(cluster: WordDecisionItem<E>[]): (WordRange<E>) | null => {
  if (cluster.length === 0) {
    return null;
  }
  const first = cluster[0];
  const last = cluster[cluster.length - 1];
  return WordRange(first.item, first.start, last.item, last.finish);
};

const scan = <E, D>(universe: Universe<E, D>, item: E, offset: number): ScanResult<E> => {
  const text = universe.property().getText(item);
  const preLength = (text.substring(0, offset)).filter((s) => {
    return s !== '\uFEFF';
  }).length;
  const postLength = (text.substring(offset, text.length)).filter((c) => {
    return c === '\uFEFF';
  }).length;

  // We only want to identify words that are all the same language.
  const cluster = Clustering.byLanguage(universe, item);
  // We are at the left edge of the cluster.
  const leftEdge = preLength === 0 && cluster.left.length === 0;
  // We are at the right edge of the cluster.
  const rightEdge = (offset + postLength) === text.length && cluster.right.length === 0;

  return {
    all: cluster.all,
    leftEdge,
    rightEdge,
    text
  };
};

// There was only a break in the node before the current position, so
// as long as we are not already at the right edge of the node AND cluster, we extend to the
// end of the cluster.
const before = <E, D>(universe: Universe<E, D>, item: E, offset: number, bindex: number): (WordRange<E>) | null => {
  const info = scan(universe, item, offset);
  return info.rightEdge ? null : toEnd(info.all, item, bindex);
};

// There was only a break in the node after the current position, so
// as long as we are not already at the left edge of the node AND cluster, we extend from the
// start of the cluster to the index.
const after = <E, D>(universe: Universe<E, D>, item: E, offset: number, aindex: number): (WordRange<E>) | null => {
  const info = scan(universe, item, offset);
  return info.leftEdge ? null : fromStart(info.all, item, aindex);
};

// We don't need to use the cluster, because we are in the middle of two breaks. Only return something
// if the breaks aren't at the same position.
const both = <E, D>(universe: Universe<E, D>, item: E, offset: number, bindex: number, aindex: number): (WordRange<E>) | null => {
  return bindex === aindex ? null : WordRange(item, bindex, item, aindex);
};

// There are no breaks in the current node, so as long as we aren't at either edge of node/cluster,
// then we extend the length of the cluster.
const neither = <E, D>(universe: Universe<E, D>, item: E, offset: number): (WordRange<E>) | null => {
  const info = scan(universe, item, offset);
  return info.leftEdge || info.rightEdge ? null : all(info.all);
};

export {
  before,
  after,
  both,
  neither
};

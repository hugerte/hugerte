import { Num } from '@ephox/katamari';
import { Attribute, SugarElement, SugarNode } from '@ephox/sugar';

import * as DomPinpoint from './DomPinpoint';

type GetNewIndex = <T>(
  prevIndex: number,
  value: number,
  delta: number,
  min: number,
  max: number,
  oldCandidate: T,
  onNewIndex: (newIndex: number) => (T) | null
) => (T) | null;

const f = (container: SugarElement<HTMLElement>, selector: string, current: SugarElement<HTMLElement>, delta: number, getNewIndex: GetNewIndex): (SugarElement<HTMLElement>) | null => {
  const isDisabledButton = (candidate: SugarElement<HTMLElement>) =>
    SugarNode.name(candidate) === 'button' && Attribute.get(candidate, 'disabled') === 'disabled';

  const tryNewIndex = (initial: number, index: number, candidates: Array<SugarElement<HTMLElement>>): (SugarElement<HTMLElement>) | null =>
    getNewIndex(initial, index, delta, 0, candidates.length - 1, candidates[index],
      (newIndex) => isDisabledButton(candidates[newIndex]) ?
        tryNewIndex(initial, newIndex, candidates) :
        (candidates[newIndex] ?? null)
    );

  // I wonder if this will be a problem when the focused element is invisible (shouldn't happen)
  return DomPinpoint.locateVisible(container, current, selector).bind((identified) => {
    const index = identified.index;
    const candidates = identified.candidates;
    return tryNewIndex(index, index, candidates);
  });
};

const horizontalWithoutCycles = (container: SugarElement<HTMLElement>, selector: string, current: SugarElement<HTMLElement>, delta: number): (SugarElement<HTMLElement>) | null =>
  f(container, selector, current, delta, (prevIndex, v, d, min, max, oldCandidate, onNewIndex) => {
    const newIndex = Num.clamp(v + d, min, max);
    return newIndex === prevIndex ? (oldCandidate ?? null) : onNewIndex(newIndex);
  });

const horizontal = (container: SugarElement<HTMLElement>, selector: string, current: SugarElement<HTMLElement>, delta: number): (SugarElement<HTMLElement>) | null =>
  f(container, selector, current, delta, (prevIndex, v, d, min, max, _oldCandidate, onNewIndex) => {
    const newIndex = Num.cycleBy(v, d, min, max);
    // If we've cycled back to the original index, we've failed to find a new valid candidate
    return newIndex === prevIndex ? null : onNewIndex(newIndex);
  });

export {
  horizontal,
  horizontalWithoutCycles
};

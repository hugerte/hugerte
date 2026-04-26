import { Universe } from '@ephox/boss';
import { Adt } from '@ephox/katamari';
import { Descent, Direction, Gather, Seeker, Spot, SpotPoint, Transition } from '@ephox/phoenix';

import * as Structure from '../api/general/Structure';

export interface TextSeekerPhase<E> {
  fold: <T> (
    abort: () => T,
    kontinue: () => T,
    finish: (info: SpotPoint<E>) => T
  ) => T;
  match: <T> (branches: {
    abort: () => T;
    kontinue: () => T;
    finish: (info: SpotPoint<E>) => T;
  }) => T;
  log: (label: string) => void;
}

export interface TextSeekerOutcome<E> {
  fold: <T> (
    aborted: () => T,
    edge: (element: E) => T,
    success: (info: SpotPoint<E>) => T
  ) => T;
  match: <T> (branches: {
    aborted: () => T;
    edge: (element: E) => T;
    success: (info: SpotPoint<E>) => T;
  }) => T;
  log: (label: string) => void;
}

const walkLeft = Gather.walkers().left();
const walkRight = Gather.walkers().right();

const phase: {
  abort: <E>() => TextSeekerPhase<E>;
  kontinue: <E>() => TextSeekerPhase<E>;
  finish: <E>(info: SpotPoint<E>) => TextSeekerPhase<E>;
} = Adt.generate([
  { abort: [ ] },
  { kontinue: [ ] },
  { finish: [ 'info' ] }
]);

export type TextSeekerPhaseConstructor = typeof phase;
export type TextSeekerPhaseProcessor<E, D> = (universe: Universe<E, D>, phase: TextSeekerPhaseConstructor, item: E, text: string, offsetOption: (number) | null) => TextSeekerPhase<E>;

const outcome: {
  aborted: <E>() => TextSeekerOutcome<E>;
  edge: <E>(element: E) => TextSeekerOutcome<E>;
  success: <E>(info: SpotPoint<E>) => TextSeekerOutcome<E>;
} = Adt.generate([
  { aborted: [] },
  { edge: [ 'element' ] },
  { success: [ 'info' ] }
]);

const isBoundary = <E, D>(universe: Universe<E, D>, item: E) => {
  return Structure.isEmptyTag(universe, item) || universe.property().isBoundary(item);
};

const repeat = <E, D>(universe: Universe<E, D>, item: E, mode: Transition, offsetOption: (number) | null, process: TextSeekerPhaseProcessor<E, D>, walking: Direction, recent: (E) | null): TextSeekerOutcome<E> => {
  const terminate = () => {
    return recent.fold<TextSeekerOutcome<E>>(outcome.aborted, outcome.edge);
  };

  const recurse = (newRecent: (E) | null) => {
    return Gather.walk(universe, item, mode, walking).fold(
      terminate,
      (prev) => {
        return repeat(universe, prev.item, prev.mode, null, process, walking, newRecent);
      }
    );
  };

  if (isBoundary(universe, item)) {
    return terminate();
  } else if (!universe.property().isText(item)) {
    return recurse(recent);
  } else {
    const text = universe.property().getText(item);
    return process(universe, phase, item, text, offsetOption).fold(
      terminate,
      () => {
        return recurse(item);
      },
      outcome.success
    );
  }
};

const descendToLeft = <E, D>(universe: Universe<E, D>, item: E, offset: number, isRoot: (e: E) => boolean): (SpotPoint<E>) | null => {
  const descended = Descent.toLeaf(universe, item, offset);
  if (universe.property().isText(item)) {
    return null;
  } else {
    return Seeker.left(universe, descended.element, universe.property().isText, isRoot).map((t) => {
      return Spot.point(t, universe.property().getText(t).length);
    });
  }
};

const descendToRight = <E, D>(universe: Universe<E, D>, item: E, offset: number, isRoot: (e: E) => boolean): (SpotPoint<E>) | null => {
  const descended = Descent.toLeaf(universe, item, offset);
  if (universe.property().isText(item)) {
    return null;
  } else {
    return Seeker.right(universe, descended.element, universe.property().isText, isRoot).map((t) => {
      return Spot.point(t, 0);
    });
  }
};

const findTextNeighbour = <E, D>(universe: Universe<E, D>, item: E, offset: number): SpotPoint<E> => {
  const stopAt = (item: E) => isBoundary(universe, item);
  return descendToLeft(universe, item, offset, stopAt).orThunk(() => {
    return descendToRight(universe, item, offset, stopAt);
  }) ?? (Spot.point(item, offset));
};

const repeatLeft = <E, D>(universe: Universe<E, D>, item: E, offset: number, process: TextSeekerPhaseProcessor<E, D>): TextSeekerOutcome<E> => {
  const initial = findTextNeighbour(universe, item, offset);
  return repeat(universe, initial.element, Gather.sidestep, initial.offset, process, walkLeft, null);
};

const repeatRight = <E, D>(universe: Universe<E, D>, item: E, offset: number, process: TextSeekerPhaseProcessor<E, D>): TextSeekerOutcome<E> => {
  const initial = findTextNeighbour(universe, item, offset);
  return repeat(universe, initial.element, Gather.sidestep, initial.offset, process, walkRight, null);
};

export const TextSeeker = {
  repeatLeft,
  repeatRight
};

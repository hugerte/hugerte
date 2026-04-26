import { Universe } from '@ephox/boss';

import { WordScope } from '../data/WordScope';
import * as Identify from '../words/Identify';
import { ZoneDetails } from './LanguageZones';

export interface Zone<E> {
  readonly elements: E[];
  readonly lang: string;
  readonly words: WordScope[];
}

export interface Zones<E> {
  readonly zones: Zone<E>[];
}

export const fromWalking = <E, D>(universe: Universe<E, D>, groups: ZoneDetails<E>[]): Zones<E> => {
  const zones = (groups).map((group: ZoneDetails<E>) => {
    const details = group.details;
    const lang = group.lang;

    const line = (details).map((x) => x.text).join('');

    const elements = (details).map((x) => x.item);

    const words = Identify.words(line);

    return {
      lang,
      words,
      elements
    };
  });

  return {
    zones
  };
};

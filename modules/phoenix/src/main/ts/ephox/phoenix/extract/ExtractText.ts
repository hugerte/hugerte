import { Universe } from '@ephox/boss';

import * as Extract from './Extract';

const newline = '\n';
const space = ' ';

const onEmpty = <E, D>(item: E, universe: Universe<E, D>) => {
  return universe.property().name(item) === 'img' ? space : newline;
};

const from = <E, D>(universe: Universe<E, D>, item: E, optimise?: (e: E) => boolean): string => {
  const typed = Extract.typed(universe, item, optimise);
  return (typed).map((t) => {
    return t.fold(() => newline, onEmpty, universe.property().getText, universe.property().getText);
  }).join('');
};

export {
  from
};

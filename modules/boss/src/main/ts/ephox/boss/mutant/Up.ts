
import { Gene } from '../api/Gene';
import * as Comparator from './Comparator';

const selector = (item: Gene, query: string): (Gene) | null => {
  return item.parent.bind((parent) => {
    return Comparator.is(parent, query) ? parent : selector(parent, query);
  });
};

const closest = (scope: Gene, query: string): (Gene) | null => {
  return Comparator.is(scope, query) ? scope : selector(scope, query);
};

const top = (item: Gene): Gene => {
  return item.parent.fold(() => item, (parent) => {
    return top(parent);
  });
};

const predicate = (item: Gene, f: (e: Gene) => boolean): (Gene) | null => {
  return item.parent.bind((parent) => {
    return f(parent) ? parent : predicate(parent, f);
  });
};

const all = (item: Gene): Gene[] => {
  return item.parent.fold(() => [], (parent) => {
    return [ parent ].concat(all(parent));
  });
};

export {
  selector,
  closest,
  predicate,
  all,
  top
};

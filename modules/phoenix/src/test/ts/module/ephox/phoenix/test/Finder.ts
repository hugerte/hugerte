import { Gene, TestUniverse } from '@ephox/boss';


const get = (universe: TestUniverse, id: string): Gene => {
  return universe.find(universe.get(), id).getOrDie('Test element "' + id + '" not found');
};

const getAll = (universe: TestUniverse, ids: string[]): Gene[] => {
  return ids.map((id) =) {
    return get(universe, id);
  });
};

export {
  get,
  getAll
};

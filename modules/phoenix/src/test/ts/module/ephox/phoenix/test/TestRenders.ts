import { Gene } from '@ephox/boss';


import { TypedItem } from 'ephox/phoenix/api/data/TypedItem';

const typeditem = (a: TypedItem<Gene, undefined>): string => {
  return a.fold((item) => {
    return 'boundary(' + item.id + ')';
  }, (item) => {
    return 'empty(' + item.id + ')';
  }, (item) => {
    return 'text("' + item.text + '")';
  }, (item) => {
    return 'text("' + item.text + '")';
  });
};

const typeditems = (items: TypedItem<Gene, undefined>[]): string[] => {
  return items.map(typeditem);
};

const ids = (items: Gene[]): string[] => {
  return items.map(id);
};

const id = (item: Gene): string => {
  return item.id;
};

const texts = (items: Gene[]): string[] => {
  return items.map(text);
};

const text = (item: Gene): string => {
  return item.text ?? null.getOr('');
};

export {
  typeditem,
  typeditems,
  ids,
  id,
  texts,
  text
};

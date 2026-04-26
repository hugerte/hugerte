import { ItemTypes } from '@ephox/alloy';

export const searchResultsClass = 'tox-collection--results__js';

// NOTE: this is operating on the the final AlloySpec
export const augmentWithAria = (item: ItemTypes.ItemSpec): ItemTypes.ItemSpec => {
  if (item.dom) {
    return {
      ...item,
      dom: {
        ...item.dom,
        attributes: {
          ...item.dom.attributes ?? { },
          'id': (('aria-item-search-result-id') + '_' + Math.floor(Math.random() * 1e9) + Date.now()),
          'aria-selected': 'false'
        }
      }
    };
  } else {
    return item;
  }
};
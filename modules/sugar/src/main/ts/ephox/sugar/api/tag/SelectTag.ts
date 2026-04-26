

import { SugarElement } from '../node/SugarElement';

const getValueFromIndex = (options: HTMLOptionsCollection, index: number): string | null => {
  return (options[index] ?? null).bind((optionVal) => optionVal.value ?? null);
};

const getValue = (select: SugarElement<HTMLSelectElement>): string | null => {
  const selectDom = select.dom;
  return getValueFromIndex(selectDom.options, selectDom.selectedIndex);
};

const add = (select: SugarElement<HTMLSelectElement>, option: SugarElement<HTMLOptionElement>): void => {
  select.dom.add(option.dom);
};

const addAll = (select: SugarElement<HTMLSelectElement>, options: SugarElement<HTMLOptionElement>[]): void => {
  options.forEach((option) => {
    add(select, option);
  });
};

const setSelected = (select: SugarElement<HTMLSelectElement>, index: number): void => {
  select.dom.selectedIndex = index;
};

export {
  getValue,
  add,
  addAll,
  setSelected
};

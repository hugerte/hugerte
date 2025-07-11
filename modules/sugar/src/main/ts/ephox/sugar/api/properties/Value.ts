import { SugarElement } from '../node/SugarElement';

type TogglableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | HTMLOptionElement | HTMLButtonElement;

/** @deprecated Get `element.dom.value` instead. */
const get = (element: SugarElement<TogglableElement>): string =>
  element.dom.value;

/** @deprecated Set `element.dom.value` instead. */
const set = (element: SugarElement<TogglableElement>, value: string): void => {
  if (value === undefined) {
    throw new Error('Value.set was undefined');
  }
  element.dom.value = value;
};

export {
  set,
  get
};

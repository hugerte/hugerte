import { Attribute, SugarElement } from '@ephox/sugar';

export const labelledBy = (labelledElement: SugarElement<Element>, labelElement: SugarElement<Element>): void => {
  const labelId = Attribute.getOpt(labelledElement, 'id')
    .fold(() => {
      const id = (('dialog-label') + '_' + Math.floor(Math.random() * 1e9) + Date.now());
      Attribute.set(labelElement, 'id', id);
      return id;
    }, (x: any) => x);

  Attribute.set(labelledElement, 'aria-labelledby', labelId);
};

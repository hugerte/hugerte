import { Fun, Id } from '@hugemce/katamari';
import { Attribute, SugarElement } from '@hugemce/sugar';

export const labelledBy = (labelledElement: SugarElement<Element>, labelElement: SugarElement<Element>): void => {
  const labelId = Attribute.getOpt(labelledElement, 'id')
    .fold(() => {
      const id = Id.generate('dialog-label');
      Attribute.set(labelElement, 'id', id);
      return id;
    }, Fun.identity);

  Attribute.set(labelledElement, 'aria-labelledby', labelId);
};

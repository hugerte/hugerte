import { Attribute, SugarElement } from '@ephox/sugar';

const describedBy = (describedElement: SugarElement<Element>, describeElement: SugarElement<Element>): void => {
  const describeId = (Attribute.get(describedElement, 'id') ?? null)
    .fold(() => {
      const id = (('dialog-describe') + '_' + Math.floor(Math.random() * 1e9) + Date.now());
      Attribute.set(describeElement, 'id', id);
      return id;
    }, (x: any) => x);

  Attribute.set(describedElement, 'aria-describedby', describeId);
};

export {
  describedBy
};

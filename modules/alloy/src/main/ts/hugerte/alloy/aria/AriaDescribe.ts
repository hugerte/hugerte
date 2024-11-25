import { Fun, Id, Optional } from "@hugerte/katamari";
import { Attribute, SugarElement } from "@hugerte/sugar";

const describedBy = (describedElement: SugarElement<Element>, describeElement: SugarElement<Element>): void => {
  const describeId = Optional.from(Attribute.get(describedElement, 'id'))
    .fold(() => {
      const id = Id.generate('dialog-describe');
      Attribute.set(describeElement, 'id', id);
      return id;
    }, Fun.identity);

  Attribute.set(describedElement, 'aria-describedby', describeId);
};

export {
  describedBy
};

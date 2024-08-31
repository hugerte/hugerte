import { Optional } from '@hugemce/katamari';
import { SugarElement } from '@hugemce/sugar';

import { AlloyComponent } from './ComponentApi';

const toElem = (component: AlloyComponent): SugarElement<any> => component.element;

const getByUid = (component: AlloyComponent, uid: string): Optional<AlloyComponent> => component.getSystem().getByUid(uid).toOptional();

export {
  toElem,
  getByUid
};

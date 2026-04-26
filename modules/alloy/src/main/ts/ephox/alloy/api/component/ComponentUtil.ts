import { SugarElement } from '@ephox/sugar';

import { AlloyComponent } from './ComponentApi';

const toElem = (component: AlloyComponent): SugarElement<any> => component.element;

const getByUid = (component: AlloyComponent, uid: string): (AlloyComponent) | null => component.getSystem().getByUid(uid).toOptional();

export {
  toElem,
  getByUid
};

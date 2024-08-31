import { AlloyComponent } from '@hugemce/alloy';
import { Css } from '@hugemce/sugar';

const forceInitialSize = (comp: AlloyComponent): void => Css.set(comp.element, 'width', Css.get(comp.element, 'width'));

export {
  forceInitialSize
};

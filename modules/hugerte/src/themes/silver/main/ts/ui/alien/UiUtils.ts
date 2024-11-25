import { AlloyComponent } from "@hugerte/alloy";
import { Css } from "@hugerte/sugar";

const forceInitialSize = (comp: AlloyComponent): void => Css.set(comp.element, 'width', Css.get(comp.element, 'width'));

export {
  forceInitialSize
};

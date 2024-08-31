import { Assertions, Chain, Step } from '@hugemce/agar';

import { Representing } from 'hugemce/alloy/api/behaviour/Representing';
import { AlloyComponent } from 'hugemce/alloy/api/component/ComponentApi';

const cGetValue = Chain.mapper((component: AlloyComponent) => Representing.getValue(component));

const cSetValue = (value: any): Chain<AlloyComponent, AlloyComponent> =>
  Chain.op((component: AlloyComponent) => {
    Representing.setValue(component, value);
  });

const sSetValue = <T>(component: AlloyComponent, value: any): Step<T, T> =>
  Step.sync(() => {
    Representing.setValue(component, value);
  });

const sAssertValue = <T>(label: string, expected: any, component: AlloyComponent): Step<T, T> =>
  Chain.asStep(component, [
    cGetValue,
    Assertions.cAssertEq(label, expected)
  ]);

export {
  cGetValue,
  cSetValue,
  sAssertValue,
  sSetValue
};

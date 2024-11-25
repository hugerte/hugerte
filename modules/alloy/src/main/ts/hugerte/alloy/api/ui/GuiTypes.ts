import { Objects } from "@hugerte/boulder";
import { Id, Obj, Optional } from "@hugerte/katamari";
import { SugarElement } from "@hugerte/sugar";

import * as FunctionAnnotator from '../../debugging/FunctionAnnotator';
import { AlloyComponent } from '../component/ComponentApi';
import { AlloySpec, PremadeSpec } from '../component/SpecTypes';

const premadeTag = Id.generate('alloy-premade');

const premade = (comp: AlloyComponent): PremadeSpec => {
  Object.defineProperty(comp.element.dom, premadeTag, {
    value: comp.uid,
    writable: true
  });
  return Objects.wrap(premadeTag, comp);
};

const isPremade = (element: SugarElement<Node>): boolean =>
  Obj.has(element.dom as any, premadeTag);

const getPremade = (spec: AlloySpec): Optional<AlloyComponent> =>
  Obj.get<any, string>(spec, premadeTag);

const makeApi = <A, R>(f: (api: A, comp: AlloyComponent, ...rest: any[]) => R): FunctionAnnotator.FunctionWithAnnotation<(comp: AlloyComponent, ...rest: any[]) => R> =>
  FunctionAnnotator.markAsSketchApi(
    (component: AlloyComponent, ...rest: any[]) => f(component.getApis(), component, ...rest),
    f
  );

export {
  makeApi,
  premade,
  getPremade,
  isPremade
};

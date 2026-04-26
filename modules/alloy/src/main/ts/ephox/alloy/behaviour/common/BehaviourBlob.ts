import { FieldProcessor, FieldSchema, StructureSchema } from '@ephox/boulder';
import { Optional } from '@ephox/katamari';

import { BehaviourState, BehaviourStateInitialiser, NoState } from './BehaviourState';
import { AlloyBehaviour, BehaviourConfigDetail, BehaviourConfigSpec, BehaviourRecord } from './BehaviourTypes';

export interface BehaviourConfigAndState<C extends BehaviourConfigDetail, S extends BehaviourState> {
  config: C;
  state: S;
}

export interface BehaviourSpec<C extends BehaviourConfigSpec, D extends BehaviourConfigDetail, S extends BehaviourState> {
  config: C;
  state: BehaviourStateInitialiser<D, S>;
}

export interface BehaviourData<C extends BehaviourConfigSpec, D extends BehaviourConfigDetail, S extends BehaviourState> {
  list: Array<AlloyBehaviour<C, D, S>>;
  data: Record<string, () => (BehaviourConfigAndState<D, S>) | null>;
}

const generateFrom = (spec: { behaviours?: BehaviourRecord }, all: Array<AlloyBehaviour<BehaviourConfigSpec, BehaviourConfigDetail, BehaviourState>>): BehaviourData<BehaviourConfigSpec, BehaviourConfigDetail, BehaviourState> => {
  /*
   * This takes a basic record of configured behaviours, defaults their state
   * and ensures that all the behaviours were valid. Will need to document
   * this entire process. Let's see where this is used.
   */
  const schema: FieldProcessor[] = (all).map((a) =>
    // Optional here probably just due to ForeignGui listing everything it supports. Can most likely
    // change it to strict once I fix the other errors.
    FieldSchema.optionObjOf(a.name(), [
      FieldSchema.required('config'),
      FieldSchema.defaulted('state', NoState)
    ]));

  type B = Record<string, (BehaviourSpec<BehaviourConfigSpec, BehaviourConfigDetail, BehaviourState>) | null>;
  const validated = StructureSchema.asRaw<B>(
    'component.behaviours',
    StructureSchema.objOf(schema),
    spec.behaviours
  ).fold((errInfo) => {
    throw new Error(
      StructureSchema.formatError(errInfo) + '\nComplete spec:\n' +
        JSON.stringify(spec, null, 2)
    );
  }, (x: any) => x);

  return {
    list: all,
    data: Object.fromEntries(Object.entries(validated).map(([_k, _v]: [any, any]) => [_k, ((optBlobThunk) => {
      const output = optBlobThunk.map((blob) => ({
        config: blob.config,
        state: blob.state.init(blob.config)
      }));
      return () => output;
    })(_v, _k as any)]))
  };
};

const getBehaviours = <C extends BehaviourConfigSpec, D extends BehaviourConfigDetail, S extends BehaviourState>(bData: BehaviourData<C, D, S>): Array<AlloyBehaviour<C, D, S>> => bData.list;

const getData = <C extends BehaviourConfigSpec, D extends BehaviourConfigDetail, S extends BehaviourState>(bData: BehaviourData<C, D, S>): Record<string, () => (BehaviourConfigAndState<D, S>) | null> => bData.data;

export {
  generateFrom,
  getBehaviours,
  getData
};

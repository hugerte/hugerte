import { FieldProcessor, FieldSchema } from '@ephox/boulder';

import { AlloyBehaviourRecord, derive, NamedConfiguredBehaviour } from '../behaviour/Behaviour';

export interface SketchBehaviours {
  dump: AlloyBehaviourRecord;
}

const field = (name: string, forbidden: Array<{ name: () => string }>): FieldProcessor =>
  FieldSchema.defaultedObjOf(name, { }, (forbidden).map((f) => FieldSchema.forbid(f.name(), 'Cannot configure ' + f.name() + ' for ' + name)).concat([
    FieldSchema.customField('dump', (x: any) => x)
  ]));

const get = (data: SketchBehaviours): AlloyBehaviourRecord => data.dump;

const augment = (data: SketchBehaviours, original: Array<NamedConfiguredBehaviour<any, any, any>>): AlloyBehaviourRecord => ({
  ...derive(original),
  ...data.dump
});

// Is this used?
export const SketchBehaviours = {
  field,
  augment,
  get
};

export {
  field,
  get,
  augment
};

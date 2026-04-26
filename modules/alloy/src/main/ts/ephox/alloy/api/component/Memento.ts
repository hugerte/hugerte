
import * as Tagger from '../../registry/Tagger';
import { isSketchSpec } from '../ui/Sketcher';
import { AlloyComponent } from './ComponentApi';
import { SimpleOrSketchSpec } from './SpecTypes';

export interface MementoRecord {
  get: (comp: AlloyComponent) => AlloyComponent;
  getOpt: (comp: AlloyComponent) => (AlloyComponent) | null;
  asSpec: () => SimpleOrSketchSpec;
}

const record = (spec: SimpleOrSketchSpec): MementoRecord => {
  const uid = isSketchSpec(spec) && (Object.prototype.hasOwnProperty.call(spec, 'uid') && (spec)['uid'] != null) ? spec.uid : Tagger.generate('memento');

  const get = (anyInSystem: AlloyComponent): AlloyComponent => anyInSystem.getSystem().getByUid(uid).getOrDie();

  const getOpt = (anyInSystem: AlloyComponent): (AlloyComponent) | null => anyInSystem.getSystem().getByUid(uid).toOptional();

  const asSpec = (): SimpleOrSketchSpec => ({
    ...spec,
    uid
  });

  return {
    get,
    getOpt,
    asSpec
  };
};

export {
  record
};


import * as BehaviourBlob from '../../behaviour/common/BehaviourBlob';
import { AlloyBehaviour, AlloyBehaviourRecord } from '../behaviour/Behaviour';

// This goes through the list of behaviours defined for a particular spec (removing anything
// that has been revoked), and returns the BehaviourType (e.g. Sliding)
const getBehaviours = (spec: { behaviours?: AlloyBehaviourRecord }): Array<AlloyBehaviour<any, any, any>> => {
  const behaviours: AlloyBehaviourRecord = ((spec)['behaviours'] ?? null) ?? ({ });
  return (Object.keys(behaviours)).flatMap((name) => {
    const behaviour = behaviours[name];
    return (behaviour) != null ? [ behaviour.me ] : [];
  });
};

const generateFrom = (spec: { behaviours?: AlloyBehaviourRecord }, all: Array<AlloyBehaviour<any, any, any>>): BehaviourBlob.BehaviourData<any, any, any> => BehaviourBlob.generateFrom(spec, all);

const generate = (spec: { behaviours?: AlloyBehaviourRecord }): BehaviourBlob.BehaviourData<any, any, any> => {
  const all = getBehaviours(spec);
  return generateFrom(spec, all);
};

export {
  generate,
  generateFrom
};

import * as AlloyEvents from '../../api/events/AlloyEvents';
import { Stateless } from '../common/BehaviourState';
import * as InvalidateApis from './InvalidateApis';
import { InvalidatingConfig } from './InvalidateTypes';

const events = (invalidConfig: InvalidatingConfig, invalidState: Stateless): AlloyEvents.AlloyEventRecord => invalidConfig.validator.map((validatorInfo) => AlloyEvents.derive([
  AlloyEvents.run(validatorInfo.onEvent, (component) => {
    InvalidateApis.run(component, invalidConfig, invalidState);
  })
].concat(validatorInfo.validateOnLoad ? [
  AlloyEvents.runOnAttached((component) => {
    InvalidateApis.run(component, invalidConfig, invalidState);
  })
] : [ ]))).getOr({ });

export {
  events
};

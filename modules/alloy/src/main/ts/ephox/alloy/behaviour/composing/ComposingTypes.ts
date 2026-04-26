
import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';

export interface ComposingBehaviour extends Behaviour.AlloyBehaviour<ComposingConfigSpec, ComposingConfig> {
  config: (config: ComposingConfigSpec) => Behaviour.NamedConfiguredBehaviour<ComposingConfigSpec, ComposingConfig>;
  getCurrent: (sandbox: AlloyComponent) => (AlloyComponent) | null;
}

export interface ComposingConfigSpec extends Behaviour.BehaviourConfigSpec {
  find: (comp: AlloyComponent) => (AlloyComponent) | null;
}

export interface ComposingConfig extends Behaviour.BehaviourConfigDetail {
  find: (comp: AlloyComponent) => (AlloyComponent) | null;
}

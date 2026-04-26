
import * as Behaviour from '../../api/behaviour/Behaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec } from '../../api/component/SpecTypes';
import { BehaviourState } from '../common/BehaviourState';

export interface ReflectingBehaviour<I, S> extends Behaviour.AlloyBehaviour<ReflectingConfigSpec<I, S>, ReflectingConfig<I, S>> {
  config: (config: ReflectingConfigSpec<I, S>) => Behaviour.NamedConfiguredBehaviour<ReflectingConfigSpec<I, S>, ReflectingConfig<I, S>>;
  getState: (comp: AlloyComponent) => ReflectingState<S>;
}

export interface ReflectingConfigSpec<I, S> extends Behaviour.BehaviourConfigSpec {
  channel: string;
  renderComponents?: (data: I, state: (S) | null) => AlloySpec[ ];
  updateState?: (comp: AlloyComponent, data: I) => (S) | null;
  initialData?: I;
  reuseDom?: boolean;
}

export interface ReflectingState<S> extends BehaviourState {
  get: () => (S) | null;
  set: (optS: (S) | null) => void;
  clear: () => void;
}

export interface ReflectingConfig<I, S> extends Behaviour.BehaviourConfigDetail {
  channel: string;
  renderComponents: ((data: I, state: (S) | null) =) | null AlloySpec[ ]>;
  updateState: ((comp: AlloyComponent, data: I) =) | null (S) | null>;
  initialData: (any) | null;
  reuseDom: boolean;
}

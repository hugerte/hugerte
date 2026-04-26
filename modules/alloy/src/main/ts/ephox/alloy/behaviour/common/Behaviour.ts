import { StructureProcessor, FieldSchema, StructureSchema, FieldProcessor } from '@ephox/boulder';


import { AlloyComponent } from '../../api/component/ComponentApi';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as FunctionAnnotator from '../../debugging/FunctionAnnotator';
import { DomDefinitionDetail } from '../../dom/DomDefinition';
import * as DomModification from '../../dom/DomModification';
import { CustomEvent } from '../../events/SimulatedEvent';
import { BehaviourConfigAndState } from './BehaviourBlob';
import { BehaviourState, BehaviourStateInitialiser } from './BehaviourState';
import {
  AlloyBehaviour, BehaviourActiveSpec, BehaviourApiFunc, BehaviourApisRecord, BehaviourConfigDetail, BehaviourConfigSpec, BehaviourExtraRecord,
  BehaviourInfo, NamedConfiguredBehaviour
} from './BehaviourTypes';

export type WrappedApiFunc<T extends (comp: AlloyComponent, config: any, state: any, ...args: any[]) => any> = T extends (comp: AlloyComponent, config: any, state: any, ...args: infer P) => infer R ? (comp: AlloyComponent, ...args: P) => R : never;
type Executor<D extends BehaviourConfigDetail, S extends BehaviourState> = (component: AlloyComponent, bconfig: D, bState: S) => void;

export type AlloyBehaviourWithApis<
  C extends BehaviourConfigSpec,
  D extends BehaviourConfigDetail,
  S extends BehaviourState,
  A extends BehaviourApisRecord<D, S>,
  E extends BehaviourExtraRecord<E>
> = AlloyBehaviour<C, D, S> & { [K in keyof A]: WrappedApiFunc<A[K]> } & E;

const executeEvent = <C extends BehaviourConfigSpec, S extends BehaviourState>(bConfig: C, bState: S, executor: Executor<C, S>): AlloyEvents.AlloyEventKeyAndHandler<CustomEvent> => AlloyEvents.runOnExecute((component) => {
  executor(component, bConfig, bState);
});

const loadEvent = <C extends BehaviourConfigSpec, S extends BehaviourState>(bConfig: C, bState: S, f: Executor<C, S>): AlloyEvents.AlloyEventKeyAndHandler<CustomEvent> => AlloyEvents.runOnInit((component, _simulatedEvent) => {
  f(component, bConfig, bState);
});

const create = <
  C extends BehaviourConfigSpec,
  D extends BehaviourConfigDetail,
  S extends BehaviourState,
  A extends BehaviourApisRecord<D, S>,
  E extends BehaviourExtraRecord<E>
>(schema: FieldProcessor[], name: string, active: BehaviourActiveSpec<D, S>, apis: A, extra: E, state: BehaviourStateInitialiser<D, S>): AlloyBehaviourWithApis<C, D, S, A, E> => {
  const configSchema = StructureSchema.objOfOnly(schema);
  const schemaSchema = FieldSchema.optionObjOf(name, [
    FieldSchema.optionObjOfOnly('config', schema)
  ]);
  return doCreate<C, D, S, A, E>(configSchema, schemaSchema, name, active, apis, extra, state);
};

const createModes = <
  C extends BehaviourConfigSpec,
  D extends BehaviourConfigDetail,
  S extends BehaviourState,
  A extends BehaviourApisRecord<D, S>,
  E extends BehaviourExtraRecord<E>
>(modes: StructureProcessor, name: string, active: BehaviourActiveSpec<D, S>, apis: A, extra: E, state: BehaviourStateInitialiser<D, S>): AlloyBehaviourWithApis<C, D, S, A, E> => {
  const configSchema = modes;
  const schemaSchema = FieldSchema.optionObjOf(name, [
    FieldSchema.optionOf('config', modes)
  ]);
  return doCreate<C, D, S, A, E>(configSchema, schemaSchema, name, active, apis, extra, state);
};

const wrapApi = <D extends BehaviourConfigDetail, S extends BehaviourState>(bName: string, apiFunction: BehaviourApiFunc<D, S>, apiName: string) => {
  const f = (component: AlloyComponent, ...rest: any[]) => {
    const args = [ component ].concat(rest);
    return component.config({
      name: () => bName
    } as AlloyBehaviour<any, any, any>).fold(
      () => {
        throw new Error('We could not find any behaviour configuration for: ' + bName + '. Using API: ' + apiName);
      },
      (info) => {
        const rest = Array.prototype.slice.call(args, 1);
        return apiFunction.apply(undefined, ([ component, info.config, info.state ] as any).concat(rest));
      }
    );
  };
  return FunctionAnnotator.markAsBehaviourApi(f, apiName, apiFunction);
};

// I think the "revoke" idea is fragile at best.
const revokeBehaviour = (name: string): NamedConfiguredBehaviour<any, any, any> => ({
  key: name,
  value: undefined
});

const doCreate = <
  C extends BehaviourConfigSpec,
  D extends BehaviourConfigDetail,
  S extends BehaviourState,
  A extends BehaviourApisRecord<D, S>,
  E extends BehaviourExtraRecord<E>
>(configSchema: StructureProcessor, schemaSchema: FieldProcessor, name: string, active: BehaviourActiveSpec<D, S>, apis: A, extra: E, state: BehaviourStateInitialiser<D, S>): AlloyBehaviourWithApis<C, D, S, A, E> => {
  const getConfig = (info: BehaviourInfo<D, S>) => (Object.prototype.hasOwnProperty.call(info, name) && (info)[name] != null) ? info[name]() : null;

  const wrappedApis = Object.fromEntries(Object.entries(apis).map(([_k, _v]: [any, any]) => [_k, ((apiF, apiName) => wrapApi(name, apiF, apiName))(_v, _k as any)])) as { [K in keyof A]: WrappedApiFunc<A[K]> };

  const wrappedExtra = Object.fromEntries(Object.entries(extra).map(([_k, _v]: [any, any]) => [_k, ((extraF, extraName) => FunctionAnnotator.markAsExtraApi(extraF, extraName))(_v, _k as any)])) as E;

  const me: AlloyBehaviour<C, D, S> & typeof wrappedApis & typeof extra = {
    ...wrappedExtra,
    ...wrappedApis,
    revoke: ((..._rest: any[]) => (revokeBehaviour)(name, ..._rest)),
    config: (spec) => {
      const prepared = StructureSchema.asRawOrDie(name + '-config', configSchema, spec);

      return {
        key: name,
        value: {
          config: prepared,
          me,
          configAsRaw: ((() => { let _called = false; let _r: any; return (..._a: any[]) => { if (!_called) { _called = true; _r = (() => StructureSchema.asRawOrDie(name + '-config', configSchema, spec))(..._a); } return _r; }; })()),
          initialConfig: spec,
          state
        }
      };
    },

    schema: () => schemaSchema,

    exhibit: (info: BehaviourInfo<D, S>, base: DomDefinitionDetail) => {
      return (getConfig(info) !== null && ((active)['exhibit'] ?? null) !== null ? ((behaviourInfo, exhibitor) => {
        return exhibitor(base, behaviourInfo.config, behaviourInfo.state);
      })(getConfig(info), ((active)['exhibit'] ?? null)) : null).getOrThunk(() => DomModification.nu({ }));
    },

    name: () => name,

    handlers: (info: BehaviourInfo<D, S>) => {
      return getConfig(info).map((behaviourInfo) => {
        const getEvents = ((active)['events'] ?? null) ?? (() => ({ }));
        return getEvents(behaviourInfo.config, behaviourInfo.state);
      }) ?? ({ });
    }
  };

  return me;
};

export {
  executeEvent,
  loadEvent,
  create,
  createModes
};

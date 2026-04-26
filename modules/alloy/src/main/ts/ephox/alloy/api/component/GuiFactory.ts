import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Cell, Result } from '@ephox/katamari';
import { SugarElement, Traverse } from '@ephox/sugar';

import * as DefaultEvents from '../../events/DefaultEvents';
import * as Tagger from '../../registry/Tagger';
import * as CustomSpec from '../../spec/CustomSpec';
import { NoContextApi } from '../system/NoContextApi';
import { AlloySystemApi } from '../system/SystemApi';
import * as GuiTypes from '../ui/GuiTypes';
import * as Component from './Component';
import { AlloyComponent } from './ComponentApi';
import { AlloySpec, PremadeSpec, SimpleOrSketchSpec, SketchSpec } from './SpecTypes';

export interface ExternalElement {
  readonly uid?: string;
  readonly element: SugarElement<Node>;
}

const buildSubcomponents = (spec: SimpleOrSketchSpec, obsoleted: (SugarElement<Node>) | null): AlloyComponent[] => {
  const components = ((spec)['components'] ?? null) ?? ([ ]);

  return obsoleted.fold(
    () => (components).map(build),
    (obs) => (components).map((c, i) => {
      return buildOrPatch(c, Traverse.child(obs, i));
    })
  );
};

const buildFromSpec = (userSpec: SketchSpec, obsoleted: (SugarElement<Node>) | null): Result<AlloyComponent, string> => {
  const { events: specEvents, ...spec }: SketchSpec = CustomSpec.make(userSpec);

  // Build the subcomponents. A spec hierarchy is built from the bottom up.
  // obsoleted is used to define which element we are attempting to replace
  // so that it might be used to patch the DOM instead of recreate it.
  const components: AlloyComponent[] = buildSubcomponents(spec, obsoleted);

  const completeSpec = {
    ...spec,
    events: { ...DefaultEvents, ...specEvents },
    components
  };

  return Result.value(
    // Note, this isn't a spec any more, because it has built children
    Component.build(completeSpec, obsoleted)
  );
};

const text = (textContent: string): PremadeSpec => {
  const element = SugarElement.fromText(textContent);

  return external({
    element
  });
};

const external = (spec: ExternalElement): PremadeSpec => {
  const extSpec: { uid: (string) | null; element: SugarElement<Node> } = StructureSchema.asRawOrDie('external.component', StructureSchema.objOfOnly([
    FieldSchema.required('element'),
    FieldSchema.option('uid')
  ]), spec);

  const systemApi = Cell(NoContextApi());

  const connect = (newApi: AlloySystemApi) => {
    systemApi.set(newApi);
  };

  const disconnect = () => {
    systemApi.set(NoContextApi(() => me));
  };

  const uid = extSpec.uid.getOrThunk(() => Tagger.generate('external'));
  Tagger.writeOnly(extSpec.element, uid);

  const me: AlloyComponent = {
    uid,
    getSystem: systemApi.get,
    config: () => null,
    hasConfigured: (() => false as const),
    connect,
    disconnect,
    getApis: <A>(): A => ({ } as any),
    element: extSpec.element,
    spec,
    readState: () => 'No state',
    syncComponents: () => {},
    components: () => [ ],
    events: { }
  };
  return GuiTypes.premade(me);
};

// We experimented with just having a counter for efficiency, but that fails for situations
// where an external JS file is using alloy, and is contained within another
// alloy root container. The ids can conflict, because the counters do not
// know about each other (being parts of separate scripts).
//
// There are other solutions than this ... not sure if they are going to have better performance, though
const uids = Tagger.generate;

const isSketchSpec = (spec: AlloySpec): spec is SketchSpec =>
  Object.prototype.hasOwnProperty.call(spec as SimpleOrSketchSpec, 'uid');

// INVESTIGATE: A better way to provide 'meta-specs'
const buildOrPatch = (spec: AlloySpec, obsoleted: (SugarElement<Node>) | null): AlloyComponent => GuiTypes.getPremade(spec).getOrThunk(() => {
  // EFFICIENCY: Consider not merging here, and passing uid through separately
  const userSpecWithUid = isSketchSpec(spec) ? spec : {
    uid: uids(''),
    ...spec
  } as SketchSpec;
  return buildFromSpec(userSpecWithUid, obsoleted).getOrDie();
});

const build = (spec: AlloySpec): AlloyComponent =>
  buildOrPatch(spec, null);

const premade = GuiTypes.premade;

export {
  build,
  buildOrPatch,
  premade,
  external,
  text
};

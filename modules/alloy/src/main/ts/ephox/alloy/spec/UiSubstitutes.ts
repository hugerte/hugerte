import { Adt } from '@ephox/katamari';

import { AlloySpec } from '../api/component/SpecTypes';
import { CompositeSketchDetail } from '../api/ui/Sketcher';
import { ConfiguredPart } from '../parts/AlloyParts';

interface Replacement {
  readonly name: () => string;
  readonly required: () => boolean;
  readonly used: () => boolean;
  readonly replace: () => UiSubstitutesAdt;
}

type ValueThunkFn<R> = <D extends CompositeSketchDetail>(detail: D, spec?: Record<string, any>, partValidated?: Record<string, any>) => R;
type SingleSubstitution<T> = (required: boolean, valueThunk: ValueThunkFn<AlloySpec>) => T;
type MultipleSubstitution<T> = (required: boolean, valueThunk: ValueThunkFn<AlloySpec[]>) => T;

export interface UiSubstitutesAdt {
  fold: <T>(
    single: SingleSubstitution<T>,
    multiple: MultipleSubstitution<T>
  ) => T;
  match: <T>(branches: {
    single: SingleSubstitution<T>;
    multiple: MultipleSubstitution<T>;
  }) => T;
  log: (label: string) => void;
}

const _placeholder = 'placeholder';

const adt: {
  single: SingleSubstitution<UiSubstitutesAdt>;
  multiple: MultipleSubstitution<UiSubstitutesAdt>;
} = Adt.generate([
  { single: [ 'required', 'valueThunk' ] },
  { multiple: [ 'required', 'valueThunks' ] }
]);

const isSubstituted = (spec: any): spec is ConfiguredPart => Object.prototype.hasOwnProperty.call(spec, 'uiType');

const subPlaceholder = <D extends CompositeSketchDetail>(owner: (string) | null, detail: D, compSpec: ConfiguredPart, placeholders: Record<string, Replacement>): UiSubstitutesAdt => {
  if (owner.exists((o) => o !== compSpec.owner)) {
    return adt.single(true, () => compSpec);
  }
  // Ignore having to find something for the time being.
  return ((placeholders as any)[compSpec.name] ?? null).fold(() => {
    throw new Error('Unknown placeholder component: ' + compSpec.name + '\nKnown: [' +
      Object.keys(placeholders) + ']\nNamespace: ' + owner ?? ('none') + '\nSpec: ' + JSON.stringify(compSpec, null, 2)
    );
  }, (newSpec) =>
    // Must return a single/multiple type
    newSpec.replace()
  );
};

const scan = <D extends CompositeSketchDetail>(owner: (string) | null, detail: D, compSpec: AlloySpec, placeholders: Record<string, Replacement>): UiSubstitutesAdt => {
  if (isSubstituted(compSpec) && compSpec.uiType === _placeholder) {
    return subPlaceholder(owner, detail, compSpec, placeholders);
  } else {
    return adt.single(false, () => compSpec);
  }
};

const substitute = <D extends CompositeSketchDetail>(owner: (string) | null, detail: D, compSpec: AlloySpec, placeholders: Record<string, Replacement>): AlloySpec[] => {
  const base = scan(owner, detail, compSpec, placeholders);

  return base.fold(
    (req, valueThunk) => {
      const value = isSubstituted(compSpec) ? valueThunk(detail, compSpec.config, compSpec.validated) : valueThunk(detail);
      const childSpecs = ((value as any)['components'] ?? null) ?? ([]);
      const substituted = (childSpecs).flatMap((c) => substitute(owner, detail, c, placeholders));
      return [
        {
          ...value,
          components: substituted
        }
      ];
    },
    (req, valuesThunk) => {
      if (isSubstituted(compSpec)) {
        const values = valuesThunk(detail, compSpec.config, compSpec.validated);
        // Allow a preprocessing step for groups before returning the components
        const preprocessor = compSpec.validated.preprocess ?? ((x: any) => x);
        return preprocessor(values);
      } else {
        return valuesThunk(detail);
      }
    }
  );
};

const substituteAll = <D extends CompositeSketchDetail>(owner: (string) | null, detail: D, components: AlloySpec[], placeholders: Record<string, Replacement>): AlloySpec[] => (components).flatMap((c) => substitute(owner, detail, c, placeholders));

const oneReplace = (label: string, replacements: UiSubstitutesAdt): Replacement => {
  let called = false;

  const used = () => called;

  const replace = () => {
    if (called) {
      throw new Error('Trying to use the same placeholder more than once: ' + label);
    }
    called = true;
    return replacements;
  };

  const required = () => replacements.fold((req, _) => req, (req, _) => req);

  return {
    name: () => label,
    required,
    used,
    replace
  };
};

const substitutePlaces = <D extends CompositeSketchDetail>(owner: (string) | null, detail: D, components: AlloySpec[], placeholders: Record<string, UiSubstitutesAdt>): AlloySpec[] => {
  const ps = Object.fromEntries(Object.entries(placeholders).map(([_k, _v]: [any, any]) => [_k, ((ph, name) => oneReplace(name, ph))(_v, _k as any)]));

  const outcome = substituteAll(owner, detail, components, ps);

  Object.entries(ps).forEach(([_k, _v]: [any, any]) => ((p: Replacement) => {
    if (p.used() === false && p.required()) {
      throw new Error(
        'Placeholder: ' + p.name() + ' was not found in components list\nNamespace: ' + owner ?? ('none') + '\nComponents: ' +
        JSON.stringify(detail.components, null, 2)
      );
    }
  })(_v, _k));

  return outcome;
};

const singleReplace = <D extends CompositeSketchDetail>(detail: D, p: UiSubstitutesAdt): AlloySpec[] =>
  p.fold((req, valueThunk) => [ valueThunk(detail) ], (req, valuesThunk) => valuesThunk(detail));

const single = adt.single;
const multiple = adt.multiple;
const placeholder = () => _placeholder;

export {
  single,
  multiple,
  placeholder,
  substituteAll,
  substitutePlaces,
  singleReplace
};

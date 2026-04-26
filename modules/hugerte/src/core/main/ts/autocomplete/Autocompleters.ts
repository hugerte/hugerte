import { StructureSchema } from '@ephox/boulder';
import { InlineContent } from '@ephox/bridge';
import { Unique } from '@ephox/katamari';

import Editor from '../api/Editor';

export interface AutocompleterDatabase {
  dataset: Record<string, InlineContent.Autocompleter>;
  triggers: string[];
  lookupByTrigger: (trigger: string) => InlineContent.Autocompleter[];
}

const register = (editor: Editor): AutocompleterDatabase => {
  const popups = editor.ui.registry.getAll().popups;
  const dataset = Object.fromEntries(Object.entries(popups).map(([_k, _v]: [any, any]) => [_k, ((popup) => InlineContent.createAutocompleter(popup).fold(
    (err) => {
      throw new Error(StructureSchema.formatError(err));
    },
    (x: any) => x
  ))(_v, _k as any)]));

  const triggers = Unique.stringArray(
    Object.entries(dataset).map(([_k, _v]: [any, any]) => ((v) => v.trigger)(_v, _k as any))
  );

  const datasetValues = Object.values(dataset);

  const lookupByTrigger = (trigger: string): InlineContent.Autocompleter[] => (datasetValues).filter((dv) => dv.trigger === trigger);

  return {
    dataset,
    triggers,
    lookupByTrigger
  };
};

export {
  register
};

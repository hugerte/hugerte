import { FieldSchema, StructureProcessor, StructureSchema } from '@hugemce/boulder';
import { Arr } from '@hugemce/katamari';

import { DialogData, DialogSpec } from '../components/dialog/Dialog';
import { getDataProcessor, getNamedItems } from './DataProcessors';

export const createDataValidator = <T extends DialogData>(structure: DialogSpec<T>): StructureProcessor => {
  const namedItems = getNamedItems(structure);
  const fields = Arr.bind(namedItems, (item) => getDataProcessor(item).fold(
    () => [],
    (schema) => [ FieldSchema.requiredOf(item.name, schema) ]
  ));

  return StructureSchema.objOf(fields);
};

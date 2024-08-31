import { FieldProcessor, FieldSchema } from '@hugemce/boulder';
import { Fun } from '@hugemce/katamari';

import * as Boxes from '../../alien/Boxes';
import SnapSchema from './SnapSchema';

const schema: FieldProcessor[] = [
  // Is this used?
  FieldSchema.defaulted('useFixed', Fun.never),
  FieldSchema.required('blockerClass'),
  FieldSchema.defaulted('getTarget', Fun.identity),
  FieldSchema.defaulted('onDrag', Fun.noop),
  FieldSchema.defaulted('repositionTarget', true),
  FieldSchema.defaulted('onDrop', Fun.noop),
  FieldSchema.defaultedFunction('getBounds', Boxes.win),
  SnapSchema
];

export {
  schema
};

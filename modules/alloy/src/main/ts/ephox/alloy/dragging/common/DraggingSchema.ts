import { FieldProcessor, FieldSchema } from '@ephox/boulder';

import * as Boxes from '../../alien/Boxes';
import SnapSchema from './SnapSchema';

const schema: FieldProcessor[] = [
  // Is this used?
  FieldSchema.defaulted('useFixed', (() => false as const)),
  FieldSchema.required('blockerClass'),
  FieldSchema.defaulted('getTarget', (x: any) => x),
  FieldSchema.defaulted('onDrag', () => {}),
  FieldSchema.defaulted('repositionTarget', true),
  FieldSchema.defaulted('onDrop', () => {}),
  FieldSchema.defaultedFunction('getBounds', Boxes.win),
  SnapSchema
];

export {
  schema
};

import { FieldSchema, ValueType } from "@hugerte/boulder";
import { Fun } from "@hugerte/katamari";

import AnchorSchema from '../../positioning/mode/AnchorSchema';

const TransitionSchema = [
  FieldSchema.requiredArrayOf('classes', ValueType.string),
  FieldSchema.defaultedStringEnum('mode', 'all', [ 'all', 'layout', 'placement' ])
];

export const PositionSchema = [
  FieldSchema.defaulted('useFixed', Fun.never),
  FieldSchema.option('getBounds')
];

export const PlacementSchema = [
  FieldSchema.requiredOf('anchor', AnchorSchema),
  FieldSchema.optionObjOf('transition', TransitionSchema)
];

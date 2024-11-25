import { FieldSchema, StructureSchema, ValueType } from "@hugerte/boulder";
import { Result } from "@hugerte/katamari";

import * as Fields from '../../data/Fields';

export default [
  FieldSchema.requiredOf('channels', StructureSchema.setOf(
    // Allow any keys.
    Result.value,
    StructureSchema.objOfOnly([
      Fields.onStrictHandler('onReceive'),
      FieldSchema.defaulted('schema', ValueType.anyValue())
    ])
  ))
];

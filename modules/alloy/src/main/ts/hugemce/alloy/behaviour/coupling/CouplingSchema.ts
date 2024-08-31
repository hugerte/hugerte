import { FieldProcessor, FieldSchema, StructureSchema, ValueType } from '@hugemce/boulder';
import { Result } from '@hugemce/katamari';

export default [
  FieldSchema.requiredOf('others', StructureSchema.setOf(Result.value, ValueType.anyValue()))
] as FieldProcessor[];
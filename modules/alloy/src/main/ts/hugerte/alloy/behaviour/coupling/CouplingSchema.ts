import { FieldProcessor, FieldSchema, StructureSchema, ValueType } from "@hugerte/boulder";
import { Result } from "@hugerte/katamari";

export default [
  FieldSchema.requiredOf('others', StructureSchema.setOf(Result.value, ValueType.anyValue()))
] as FieldProcessor[];
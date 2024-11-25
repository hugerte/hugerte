import { FieldSchema } from "@hugerte/boulder";

export default [
  FieldSchema.required('channel'),
  FieldSchema.option('renderComponents'),
  FieldSchema.option('updateState'),
  FieldSchema.option('initialData'),
  FieldSchema.defaultedBoolean('reuseDom', true)
];

import { FieldProcessor, FieldSchema } from "@hugerte/boulder";

const ComposeSchema: FieldProcessor[] = [
  FieldSchema.required('find')
];

export {
  ComposeSchema
};

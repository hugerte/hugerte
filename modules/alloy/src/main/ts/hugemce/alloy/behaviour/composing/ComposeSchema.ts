import { FieldProcessor, FieldSchema } from '@hugemce/boulder';

const ComposeSchema: FieldProcessor[] = [
  FieldSchema.required('find')
];

export {
  ComposeSchema
};

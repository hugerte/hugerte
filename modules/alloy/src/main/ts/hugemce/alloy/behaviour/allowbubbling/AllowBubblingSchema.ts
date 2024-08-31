import { FieldProcessor, FieldSchema, StructureSchema } from '@hugemce/boulder';

export default [
  FieldSchema.requiredArrayOf('events', StructureSchema.objOf([
    FieldSchema.requiredString('native'),
    FieldSchema.requiredString('simulated')
  ]))
] as FieldProcessor[];
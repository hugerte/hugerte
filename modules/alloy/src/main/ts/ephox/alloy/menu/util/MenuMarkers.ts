import { FieldSchema, StructureSchema } from '@ephox/boulder';

const menuFields = () => [
  FieldSchema.required('menu'),
  FieldSchema.required('selectedMenu')
];

const itemFields = () => [
  FieldSchema.required('item'),
  FieldSchema.required('selectedItem')
];

const schema = () => StructureSchema.objOf(
  itemFields().concat(menuFields())
);

const itemSchema = () => StructureSchema.objOf(itemFields());

export {
  menuFields,
  itemFields,
  schema,
  itemSchema
};

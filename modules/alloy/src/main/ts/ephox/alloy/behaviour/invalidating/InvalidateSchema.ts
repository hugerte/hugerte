import { FieldSchema } from '@ephox/boulder';


import * as Fields from '../../data/Fields';

export default [
  FieldSchema.required('invalidClass'),
  FieldSchema.defaulted('getRoot', () => null),

  // TODO: Completely rework the notify API
  FieldSchema.optionObjOf('notify', [
    FieldSchema.defaulted('aria', 'alert'),
    // Maybe we should use something else.
    FieldSchema.defaulted('getContainer', () => null),
    FieldSchema.defaulted('validHtml', ''),
    Fields.onHandler('onValid'),
    Fields.onHandler('onInvalid'),
    Fields.onHandler('onValidate')
  ]),

  FieldSchema.optionObjOf('validator', [
    FieldSchema.required('validate'),
    FieldSchema.defaulted('onEvent', 'input'),
    FieldSchema.defaulted('validateOnLoad', true)
  ])
];

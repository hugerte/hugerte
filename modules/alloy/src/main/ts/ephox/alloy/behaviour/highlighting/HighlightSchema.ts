import { FieldSchema } from "@hugerte/boulder";

import * as Fields from '../../data/Fields';

export default [
  FieldSchema.required('highlightClass'),
  FieldSchema.required('itemClass'),

  Fields.onHandler('onHighlight'),
  Fields.onHandler('onDehighlight')
];

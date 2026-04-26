import { FieldProcessor, FieldSchema } from '@ephox/boulder';

import * as Fields from '../../data/Fields';

export default [
  FieldSchema.defaultedFunction('disabled', (() => false as const)),
  FieldSchema.defaulted('useNative', true),
  FieldSchema.option('disableClass'),
  Fields.onHandler('onDisabled'),
  Fields.onHandler('onEnabled')
] as FieldProcessor[];

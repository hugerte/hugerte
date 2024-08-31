import { FieldProcessor, FieldSchema } from '@hugemce/boulder';
import { Fun } from '@hugemce/katamari';

import * as Fields from '../../data/Fields';

export default [
  FieldSchema.defaultedFunction('disabled', Fun.never),
  FieldSchema.defaulted('useNative', true),
  FieldSchema.option('disableClass'),
  Fields.onHandler('onDisabled'),
  Fields.onHandler('onEnabled')
] as FieldProcessor[];

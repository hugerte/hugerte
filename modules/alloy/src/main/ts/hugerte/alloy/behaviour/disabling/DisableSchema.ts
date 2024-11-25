import { FieldProcessor, FieldSchema } from "@hugerte/boulder";
import { Fun } from "@hugerte/katamari";

import * as Fields from '../../data/Fields';

export default [
  FieldSchema.defaultedFunction('disabled', Fun.never),
  FieldSchema.defaulted('useNative', true),
  FieldSchema.option('disableClass'),
  Fields.onHandler('onDisabled'),
  Fields.onHandler('onEnabled')
] as FieldProcessor[];

import { FieldSchema } from '@hugemce/boulder';
import { Fun } from '@hugemce/katamari';

import * as TabbingTypes from './TabbingTypes';

export default TabbingTypes.create(
  FieldSchema.customField('cyclic', Fun.always)
);

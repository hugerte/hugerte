import { FieldSchema } from "@hugerte/boulder";
import { Fun } from "@hugerte/katamari";

import * as TabbingTypes from './TabbingTypes';

export default TabbingTypes.create(
  FieldSchema.customField('cyclic', Fun.always)
);

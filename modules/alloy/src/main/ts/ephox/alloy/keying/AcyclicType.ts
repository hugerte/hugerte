import { FieldSchema } from '@ephox/boulder';

import * as TabbingTypes from './TabbingTypes';

export default TabbingTypes.create(
  FieldSchema.customField('cyclic', (() => false as const))
);

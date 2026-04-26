import { FieldSchema } from '@ephox/boulder';

import * as TabbingTypes from './TabbingTypes';

export default TabbingTypes.create(
  FieldSchema.customField('cyclic', (() => true as const))
);

import { FieldProcessor, FieldSchema } from "@hugerte/boulder";
import { Cell, Fun } from "@hugerte/katamari";

import { Coupling } from '../../api/behaviour/Coupling';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';

const schema: () => FieldProcessor[] = Fun.constant([
  SketchBehaviours.field('splitToolbarBehaviours', [ Coupling ]),
  FieldSchema.customField('builtGroups', () => Cell([ ]))
]);

export { schema };

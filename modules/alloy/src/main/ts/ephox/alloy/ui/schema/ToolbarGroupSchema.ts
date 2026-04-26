import { FieldSchema } from '@ephox/boulder';

import { Keying } from '../../api/behaviour/Keying';
import * as SketchBehaviours from '../../api/component/SketchBehaviours';
import * as Fields from '../../data/Fields';
import * as PartType from '../../parts/PartType';
import { ToolbarGroupDetail, ToolbarGroupSpec } from '../types/ToolbarGroupTypes';

const schema = () => [
  FieldSchema.required('items'),
  Fields.markers([ 'itemSelector' ]),
  SketchBehaviours.field('tgroupBehaviours', [ Keying ])
];

const parts: () => PartType.PartTypeAdt[] = () => [
  PartType.group<ToolbarGroupDetail, ToolbarGroupSpec>({
    name: 'items',
    unit: 'item'
  })
];

const name = () => 'ToolbarGroup';

export {
  name,
  schema,
  parts
};

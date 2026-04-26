import { FieldSchema } from '@ephox/boulder';

import * as Behaviour from '../../api/behaviour/Behaviour';
import { Replacing } from '../../api/behaviour/Replacing';
import { SketchBehaviours } from '../../api/component/SketchBehaviours';
import * as PartType from '../../parts/PartType';
import { CustomListDetail } from '../types/CustomListTypes';

const schema = () => [
  FieldSchema.defaulted('shell', false),
  FieldSchema.required('makeItem'),
  FieldSchema.defaulted('setupItem', () => {}),
  SketchBehaviours.field('listBehaviours', [ Replacing ])
];

const customListDetail = () => ({
  behaviours: Behaviour.derive([
    Replacing.config({ })
  ])
});

const itemsPart = PartType.optional<CustomListDetail>({
  name: 'items',
  overrides: customListDetail
});

const parts: () => PartType.PartTypeAdt[] = () => [
  itemsPart
];

const name = () => 'CustomList';

export {
  name,
  schema,
  parts
};

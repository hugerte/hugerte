import { FieldSchema, StructureSchema } from "@hugerte/boulder";
import { Fun } from "@hugerte/katamari";

import * as Fields from '../../data/Fields';
import * as ToggleModes from './ToggleModes';

export default [
  FieldSchema.defaulted('selected', false),
  FieldSchema.option('toggleClass'),
  FieldSchema.defaulted('toggleOnExecute', true),
  Fields.onHandler('onToggled'),

  FieldSchema.defaultedOf('aria', {
    mode: 'none'
  }, StructureSchema.choose(
    'mode', {
      pressed: [
        FieldSchema.defaulted('syncWithExpanded', false),
        Fields.output('update', ToggleModes.updatePressed)
      ],
      checked: [
        Fields.output('update', ToggleModes.updateChecked)
      ],
      expanded: [
        Fields.output('update', ToggleModes.updateExpanded)
      ],
      selected: [
        Fields.output('update', ToggleModes.updateSelected)
      ],
      none: [
        Fields.output('update', Fun.noop)
      ]
    }
  ))
];

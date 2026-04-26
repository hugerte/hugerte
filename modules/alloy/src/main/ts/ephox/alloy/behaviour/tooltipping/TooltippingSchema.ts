import { FieldSchema } from '@ephox/boulder';

import { AlloyComponent } from '../../api/component/ComponentApi';
import * as Fields from '../../data/Fields';
import * as Bubble from '../../positioning/layout/Bubble';
import * as Layout from '../../positioning/layout/Layout';
import { AnchorSpec } from '../../positioning/mode/Anchoring';

export default [
  FieldSchema.required('lazySink'),
  FieldSchema.required('tooltipDom'),
  FieldSchema.defaulted('exclusive', true),
  FieldSchema.defaulted('tooltipComponents', []),
  FieldSchema.defaultedFunction('delayForShow', () => 300),
  FieldSchema.defaultedFunction('delayForHide', () => 300),
  FieldSchema.defaultedStringEnum('mode', 'normal', [ 'normal', 'follow-highlight', 'children-keyboard-focus', 'children-normal' ]),
  FieldSchema.defaulted('anchor', (comp: AlloyComponent): AnchorSpec => ({
    type: 'hotspot',
    hotspot: comp,
    layouts: {
      onLtr: () => [ Layout.south, Layout.north, Layout.southeast, Layout.northeast, Layout.southwest, Layout.northwest ],
      onRtl: () => [ Layout.south, Layout.north, Layout.southeast, Layout.northeast, Layout.southwest, Layout.northwest ]
    },
    bubble: Bubble.nu(0, -2, {}),
  })),
  Fields.onHandler('onHide'),
  Fields.onHandler('onShow'),
];

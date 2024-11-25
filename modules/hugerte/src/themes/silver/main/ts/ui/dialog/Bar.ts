import { SimpleSpec } from "@hugerte/alloy";
import { Dialog } from "@hugerte/bridge";
import { Arr } from "@hugerte/katamari";

import { UiFactoryBackstageShared } from '../../backstage/Backstage';

type BarSpec = Omit<Dialog.Bar, 'type'>;

export const renderBar = (spec: BarSpec, backstage: UiFactoryBackstageShared): SimpleSpec => ({
  dom: {
    tag: 'div',
    classes: [ 'tox-bar', 'tox-form__controls-h-stack' ]
  },
  components: Arr.map(spec.items, backstage.interpreter)
});

import { SimpleSpec } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';

import { UiFactoryBackstageShared } from '../../backstage/Backstage';

type GridSpec = Omit<Dialog.Grid, 'type'>;

export const renderGrid = (spec: GridSpec, backstage: UiFactoryBackstageShared): SimpleSpec => ({
  dom: {
    tag: 'div',
    classes: [ 'tox-form__grid', `tox-form__grid--${spec.columns}col` ]
  },
  components: (spec.items).map(backstage.interpreter)
});

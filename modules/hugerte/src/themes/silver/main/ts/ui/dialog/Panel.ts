import { SimpleSpec } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';

import { UiFactoryBackstage } from '../../backstage/Backstage';

export type PanelSpec = Omit<Dialog.Panel, 'type'>;

const renderPanel = (spec: PanelSpec, backstage: UiFactoryBackstage): SimpleSpec => ({
  dom: {
    tag: 'div',
    classes: spec.classes
  },
  // All of the items passed through the form need to be put through the interpreter
  // with their form part preserved.
  components: (spec.items).map(backstage.shared.interpreter)
});

export {
  renderPanel
};

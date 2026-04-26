import { Behaviour, Focusing, SimpleSpec, Tabstopping } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';

type TableSpec = Omit<Dialog.Table, 'type'>;

export const renderTable = (spec: TableSpec, providersBackstage: UiFactoryBackstageProviders): SimpleSpec => {
  const renderTh = (text: string) => ({
    dom: {
      tag: 'th',
      innerHtml: providersBackstage.translate(text)
    }
  });
  const renderHeader = (header: string[]) => ({
    dom: {
      tag: 'thead'
    },
    components: [
      {
        dom: {
          tag: 'tr'
        },
        components: (header).map(renderTh)
      }
    ]
  });
  const renderTd = (text: string) => ({ dom: { tag: 'td', innerHtml: providersBackstage.translate(text) }});
  const renderTr = (row: string[]) => ({ dom: { tag: 'tr' }, components: (row).map(renderTd) });
  const renderRows = (rows: string[][]) => ({ dom: { tag: 'tbody' }, components: (rows).map(renderTr) });
  return {
    dom: {
      tag: 'table',
      classes: [ 'tox-dialog__table' ]
    },
    components: [
      renderHeader(spec.header),
      renderRows(spec.cells)
    ],
    behaviours: Behaviour.derive([
      Tabstopping.config({ }),
      Focusing.config({ })
    ])
  };
};

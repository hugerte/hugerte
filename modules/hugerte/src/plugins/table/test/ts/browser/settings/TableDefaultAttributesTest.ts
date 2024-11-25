import { ApproxStructure } from "@hugerte/agar";
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/table/Plugin';

import * as TableTestUtils from '../../module/test/TableTestUtils';

describe('browser.hugerte.plugins.table.TableDefaultAttributesTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    indent: false,
    plugins: 'table',
    base_url: '/project/hugerte/js/hugerte',
    statusbar: false,
    table_use_colgroups: false
  }, [ Plugin ], true);

  beforeEach(() => {
    hook.editor().setContent('');
  });

  it('TBA: no attributes without setting', async () => {
    const editor = hook.editor();
    await TableTestUtils.pInsertTableViaGrid(editor, 2, 2);
    TableTestUtils.assertTableStructure(editor, ApproxStructure.build((s, str) => s.element('table', {
      styles: {
        'width': str.is('100%'),
        'border-collapse': str.is('collapse')
      },
      attrs: {
        border: str.is('1')
      },
      children: TableTestUtils.createTableChildren(s, str, false)
    })));
  });

  it('TBA: test default title attribute', async () => {
    const editor = hook.editor();
    editor.options.set('table_default_attributes', { title: 'x' });
    await TableTestUtils.pInsertTableViaGrid(editor, 2, 2);
    TableTestUtils.assertTableStructure(editor, ApproxStructure.build((s, str) => s.element('table', {
      styles: {
        'width': str.is('100%'),
        'border-collapse': str.is('collapse')
      },
      attrs: {
        border: str.none('Should not have the default border'),
        title: str.is('x')
      },
      children: TableTestUtils.createTableChildren(s, str, false)
    })));
  });
});

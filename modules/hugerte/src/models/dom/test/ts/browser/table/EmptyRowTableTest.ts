import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'hugerte/core/api/Editor';

describe('browser.hugerte.models.dom.table.EmptyRowTableTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/hugerte/js/hugerte',
  }, []);

  it('TINY-4679: Empty tr elements should not be removed', () => {
    const editor = hook.editor();
    editor.setContent(`
      <div>
        <table>
          <colgroup><col></colgroup>
          <tbody>
            <tr><td rowspan="2" >TR 1</td></tr>
            <tr></tr>
            <tr><td>TR 3</td></tr>
            <tr><td >TR 4</td></tr>
          </tbody>
        </table>
      </div>
    `);
    TinyAssertions.assertContentPresence(editor, { tr: 4 });
  });
});

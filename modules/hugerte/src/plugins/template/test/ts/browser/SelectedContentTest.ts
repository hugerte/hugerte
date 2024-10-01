import { afterEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/template/Plugin';

import { pInsertTemplate } from '../module/InsertTemplate';
import { Settings } from '../module/Settings';

describe('browser.hugerte.plugins.template.SelectedContentTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'template',
    toolbar: 'template',
    base_url: '/project/hugerte/js/hugerte'
  }, [ Plugin ]);

  const { addSettings, cleanupSettings } = Settings(hook);

  afterEach(() => {
    const editor = hook.editor();
    cleanupSettings();
    editor.setContent('');
  });

  it('TBA: Test selected content replacement with default class', async () => {
    const editor = hook.editor();
    editor.setContent('Text');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
    addSettings({
      templates: [{ title: 'a', description: 'b', content: '<h1 class="selcontent">This will be replaced</h1>' }],
    });
    await pInsertTemplate(editor);
    TinyAssertions.assertContent(editor, '<h1 class="selcontent">Text</h1>');
  });

  it('TBA: Test selected content replacement with custom class', async () => {
    const editor = hook.editor();
    editor.setContent('Text');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
    addSettings({
      template_selected_content_classes: 'customSelected',
      templates: [{ title: 'a', description: 'b', content: '<h1 class="customSelected">This will be replaced/h1>' }],
    });
    await pInsertTemplate(editor);
    TinyAssertions.assertContent(editor, '<h1 class="customSelected">Text</h1>'
    );
  });
});

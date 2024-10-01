import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/directionality/Plugin';

describe('browser.hugerte.plugins.directionality.CommandsTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'directionality',
    base_url: '/project/hugerte/js/hugerte'
  }, [ Plugin ], true);

  it('TINY-9669: mceDirectionLTR on a RTL block in LTR mode should remove the dir property', () => {
    const editor = hook.editor();

    editor.setContent('<div dir="rtl">Noneditable content</div>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
    editor.execCommand('mceDirectionLTR');
    TinyAssertions.assertContent(editor, '<div>Noneditable content</div>');
  });

  it('TINY-9669: mceDirectionRTL on a LTR block in LTR mode should add RTL to the dir property', () => {
    const editor = hook.editor();

    editor.setContent('<div>Noneditable content</div>');
    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
    editor.execCommand('mceDirectionRTL');
    TinyAssertions.assertContent(editor, '<div dir="rtl">Noneditable content</div>');
  });

  it('TINY-9669: Command should not be applied to noneditable content', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      const initialContent = '<div>Noneditable content</div>';
      editor.setContent(initialContent);
      TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 2);
      editor.execCommand('mceDirectionLTR');
      TinyAssertions.assertContent(editor, initialContent);
      editor.execCommand('mceDirectionRTL');
      TinyAssertions.assertContent(editor, initialContent);
    });
  });
});


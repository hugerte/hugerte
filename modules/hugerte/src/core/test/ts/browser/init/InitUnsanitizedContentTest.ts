import { context, describe, it } from '@ephox/bedrock-client';
import { McEditor, TinyAssertions } from '@ephox/mcagar';

import Editor from 'hugerte/core/api/Editor';

describe('browser.hugerte.core.init.InitUnsanitizedContentTest', () => {
  const initAndAssertContent = (label: string, xss_sanitization: boolean, initial: string, expected: string) => {
    it(label, async () => {
      const editor = await McEditor.pFromHtml<Editor>(`<textarea>${initial}</textarea>`, {
        base_url: '/project/hugerte/js/hugerte',
        xss_sanitization
      });
      TinyAssertions.assertContent(editor, expected);
      McEditor.remove(editor);
    });
  };

  const unsanitizedHtml = '<p id="action">XSS</p>';

  context('TINY-9600: xss_sanitization: true', () => {
    const sanitizedHtml = '<p>XSS</p>';
    initAndAssertContent('should sanitize initial content', true, unsanitizedHtml, sanitizedHtml);
  });

  context('TINY-9600: xss_sanitization: false', () => {
    initAndAssertContent('should not sanitize initial content', false, unsanitizedHtml, unsanitizedHtml);
  });
});

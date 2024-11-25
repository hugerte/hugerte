import { ApproxStructure } from "@hugerte/agar";
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Unicode } from "@hugerte/katamari";
import { TinyAssertions, TinyHooks } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';

import * as Utils from '../../module/test/TextPatternsUtils';

describe('browser.hugerte.core.textpatterns.TextPatternsFalseTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'lists',
    text_patterns: false,
    base_url: '/project/hugerte/js/hugerte'
  }, [ ]);

  beforeEach(() => {
    const editor = hook.editor();
    editor.setContent('');
  });

  it('TINY-8312: Try applying italic format on single word using space and assert it does nothing', () => {
    const editor = hook.editor();
    Utils.setContentAndPressSpace(editor, '*a *', 4);
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
      return Utils.bodyStruct([
        s.element('p', {
          children: [
            s.text(str.is(`*a *${Unicode.nbsp}`), true)
          ]
        })
      ]);
    }));
  });

});

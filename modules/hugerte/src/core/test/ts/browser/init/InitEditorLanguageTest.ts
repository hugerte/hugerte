import { UiFinder } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';
import I18n from 'hugerte/core/api/util/I18n';

describe('browser.hugerte.core.init.InitEditorLanguageTest', () => {
  TinyHooks.bddSetupLight<Editor>({
    language: 'custom',
    language_url: '/project/hugerte/src/core/test/assets/langs/custom.js',
    base_url: '/project/hugerte/js/hugerte'
  }, []);

  // Copy of '/src/core/test/assets/langs/custom.js'. For assertion in test.
  const customLanguagePack = {
    source: 'translated'
  };

  it('TBA: Should have been able to load a custom language pack', () => {
    UiFinder.notExists(SugarBody.body(), '.tox-notification');
    assert.equal(I18n.getCode(), 'custom', 'I18n language code should be the custom language code');
    assert.deepEqual(I18n.getData().custom, customLanguagePack, 'I18n data should have custom language pack');
  });
});

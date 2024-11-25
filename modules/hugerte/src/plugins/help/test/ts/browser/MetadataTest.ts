import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from "@hugerte/wrap-mcagar";

import HelpPlugin from 'hugerte/plugins/help/Plugin';

import * as PluginAssert from '../module/PluginAssert';
import { selectors } from '../module/Selectors';
import FakePlugin from '../module/test/FakePlugin';
import NoMetaFakePlugin from '../module/test/NoMetaFakePlugin';

describe('browser.hugerte.plugins.help.MetadataTest', () => {
  const hook = TinyHooks.bddSetupLight({
    plugins: 'help fake nometafake',
    toolbar: 'help',
    base_url: '/project/hugerte/js/hugerte'
  }, [ HelpPlugin, FakePlugin, NoMetaFakePlugin ]);

  it('TBA: Assert Help Plugin list contains getMetadata functionality', async () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, selectors.toolbarHelpButton);
    await PluginAssert.pAssert(
      'Failed to list fake plugins',
      {
        'li a:contains("Help")': 1,
        'li a:contains("Fake")': 1,
        'li:contains("nometafake")': 1,
        'button:contains("Close")': 1
      },
      selectors.dialog,
      selectors.pluginsTab
    );
  });
});

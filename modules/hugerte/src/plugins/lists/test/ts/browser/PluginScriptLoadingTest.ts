import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';

/**
 * Regression test for the root cause behind the flaky webdriver
 * `PlaceholderTest - TINY-3917: Check placeholder hides when inserting list via command`.
 *
 * When the distribution bundles are missing from the build (a `yarn ci` run that does
 * not execute the rollup task), `js/hugerte/plugins/lists/plugin.js` is not produced.
 * The editor then fails to load the lists plugin via the script-tag path, the load
 * error is swallowed by the add-on loader, and the plugin never registers. Commands
 * such as `InsertOrderedList` then silently no-op (no mutation, no `ExecCommand`
 * event) which leaves e.g. the placeholder visible after the command.
 *
 * Note: this test deliberately does NOT import the lists Plugin module, so the plugin
 * must be loaded from the served distribution exactly like a real user install.
 */
describe('browser.hugerte.plugins.lists.PluginScriptLoadingTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/hugerte/js/hugerte',
    plugins: 'lists',
  }, []);

  it('lists plugin bundle is served and loads via script to register commands', async () => {
    // The plugin script must be present in the served distribution. A stale or
    // incomplete build (rollup outputs missing) yields a 404 here, which used to
    // silently disable the whole plugin for editors that load it from disk.
    const res = await fetch('/project/hugerte/js/hugerte/plugins/lists/plugin.js', { cache: 'no-store' });
    assert.equal(res.status, 200, 'js/hugerte/plugins/lists/plugin.js must be served by the test harness');

    const editor = hook.editor();
    assert.isOk(editor.plugins.lists, 'lists plugin should be active when loaded from the distribution');

    // The command that the flaky placeholder test relies on must be registered,
    // otherwise execCommand('InsertOrderedList') silently no-ops.
    assert.isTrue(editor.execCommand('InsertOrderedList'), 'InsertOrderedList should be a supported command');
    assert.equal(editor.getContent(), '<ol>\n<li>&nbsp;</li>\n</ol>', 'InsertOrderedList should convert the empty paragraph into an ordered list');
  });
});
import { UiFinder } from "@hugerte/agar";
import { after, before, describe, it } from '@ephox/bedrock-client';
import { Insert, Remove, SugarBody, SugarElement, Width } from "@hugerte/sugar";
import { TinyHooks } from "@hugerte/wrap-mcagar";
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';

// TODO TINY-10480: Investigate flaky tests
describe.skip('browser.hugerte.themes.silver.editor.sizing.ResizeNotInRootTest', () => {
  const expectedWidth = 300;
  let toolbarContainer: SugarElement<HTMLDivElement>;
  before(() => {
    toolbarContainer = SugarElement.fromHtml(`<div id="toolbar" style="width: ${expectedWidth}px;"></div>`);
    Insert.append(SugarBody.body(), toolbarContainer);
  });

  after(() => {
    Remove.remove(toolbarContainer);
  });

  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/hugerte/js/hugerte',
    fixed_toolbar_container: '#toolbar',
    inline: true,
  }, []);

  it('TINY-6683: Should not resize the sink to the body width', async () => {
    const editor = hook.editor();
    editor.setContent('fixed_toolbar_container test');
    editor.focus();

    const sink = await UiFinder.pWaitFor('Wait for the sink to be rendered', SugarBody.body(), '.tox-silver-sink') as SugarElement<HTMLElement>;
    const sinkWidth = Width.get(sink);
    assert.equal(sinkWidth, expectedWidth, `Sink should be ${expectedWidth}px wide`);
  });
});

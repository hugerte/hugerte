import { describe, it, before, after } from '@ephox/bedrock-client';
import { Optional } from "@hugerte/katamari";
import { TinyHooks } from "@hugerte/wrap-mcagar";
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/link/Plugin';
import { UserListItem } from 'hugerte/plugins/link/ui/DialogTypes';
import { AnchorListOptions } from 'hugerte/plugins/link/ui/sections/AnchorListOptions';
import { ClassListOptions } from 'hugerte/plugins/link/ui/sections/ClassListOptions';
import { LinkListOptions } from 'hugerte/plugins/link/ui/sections/LinkListOptions';
import { RelOptions } from 'hugerte/plugins/link/ui/sections/RelOptions';
import { TargetOptions } from 'hugerte/plugins/link/ui/sections/TargetOptions';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.hugerte.plugins.link.ListOptionsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link',
    base_url: '/project/hugerte/js/hugerte'
  }, [ Plugin ]);

  before(() => {
    TestLinkUi.clearHistory();
  });

  after(() => {
    TestLinkUi.clearHistory();
  });

  it('TBA: Checking anchor generation', () => {
    const editor = hook.editor();
    editor.setContent('<p><a name="Difference"></a>Differences anchor us</p>');

    const anchors = AnchorListOptions.getAnchors(editor);
    assert.deepEqual(
      anchors.getOr([ ]),
      [
        { text: 'None', value: '' },
        { text: 'Difference', value: '#Difference' }
      ],
      'Checking anchors found in content'
    );
  });

  it('TBA: Checking link class generation', () => {
    const editor = hook.editor();
    editor.options.set('link_class_list', [
      { title: 'Important', value: 'imp' },
      { title: 'Insignificant', value: 'insig' }
    ]);

    const classes = ClassListOptions.getClasses(editor);
    assert.deepEqual(
      classes.getOr([ ]),
      [
        { text: 'Important', value: 'imp' },
        { text: 'Insignificant', value: 'insig' }
      ],
      'Checking link classes'
    );
  });

  it('TBA: Checking link list generation', async () => {
    const editor = hook.editor();
    editor.options.set('link_list', (callback: (value: UserListItem[]) => void) => {
      callback([
        {
          title: 'Alpha',
          menu: [
            { value: 'alpha-a', title: 'Alpha-A' },
            { value: 'alpha-a', title: 'Alpha-A' }
          ]
        },
        {
          title: 'Beta',
          value: 'beta'
        }
      ]);
    });

    const links = await LinkListOptions.getLinks(editor);

    assert.deepEqual(
      links.getOr([ ]),
      [
        { text: 'None', value: '' },
        {
          text: 'Alpha',
          items: [
            { value: 'alpha-a', text: 'Alpha-A' },
            { value: 'alpha-a', text: 'Alpha-A' }
          ]
        },
        {
          text: 'Beta',
          value: 'beta'
        }
      ],
      'Checking link_list'
    );
  });

  it('TBA: Checking rel generation', () => {
    const editor = hook.editor();
    editor.options.set('link_rel_list', [
      { value: '', text: 'None' },
      { value: 'just one', text: 'Just One' }
    ]);

    const rels = RelOptions.getRels(editor, Optional.some('initial-target'));
    assert.deepEqual(
      rels.getOr([ ]),
      [
        { value: '', text: 'None' },
        { value: 'just one', text: 'Just One' }
      ],
      'Checking link_rel_list output'
    );
  });

  it('TBA: Checking targets generation', () => {
    const editor = hook.editor();
    editor.options.set('link_target_list', [
      { value: 'target1', text: 'Target1' },
      { value: 'target2', text: 'Target2' }
    ]);

    const targets = TargetOptions.getTargets(editor);
    assert.deepEqual(
      targets.getOr([ ]),
      [
        { value: 'target1', text: 'Target1' },
        { value: 'target2', text: 'Target2' }
      ],
      'Checking link_target_list output'
    );
  });
});

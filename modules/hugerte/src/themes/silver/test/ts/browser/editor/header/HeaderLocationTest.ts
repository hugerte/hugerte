import { ApproxStructure, Assertions } from "@hugerte/agar";
import { describe, it } from '@ephox/bedrock-client';
import { TinyDom, TinyHooks } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';

describe('browser.hugerte.themes.silver.editor.header.HeaderLocationTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/hugerte/js/hugerte',
    toolbar_location: 'bottom'
  }, []);

  it('Header should be located at the bottom in the editor container', () => {
    const editor = hook.editor();
    const containerApproxStructure = ApproxStructure.build((s, str, arr) => s.element('div', {
      classes: [ arr.has('tox'), arr.has('tox-hugerte') ],
      children: [
        s.element('div', {
          classes: [ arr.has('tox-editor-container') ],
          children: [
            s.element('div', {
              classes: [ arr.has('tox-sidebar-wrap') ]
            }),
            s.element('div', {
              classes: [ arr.has('tox-editor-header') ],
              children: [
                s.element('div', {
                  classes: [ arr.has('tox-menubar') ]
                }),
                s.element('div', {
                  classes: [ arr.has('tox-toolbar-overlord') ]
                }),
                s.element('div', {
                  classes: [ arr.has('tox-anchorbar') ]
                })
              ]
            }),
            s.element('div', {
              classes: [ arr.has('tox-bottom-anchorbar') ]
            }),
            s.element('div', {
              classes: [ arr.has('tox-statusbar') ]
            }),
          ]
        }),
        s.element('div', {
          classes: [ arr.has('tox-view-wrap') ]
        }),
        s.element('div', {
          classes: [ arr.has('tox-throbber') ]
        })
      ]
    }));
    Assertions.assertStructure('Editor container should match expected structure', containerApproxStructure, TinyDom.container(editor));
  });
});

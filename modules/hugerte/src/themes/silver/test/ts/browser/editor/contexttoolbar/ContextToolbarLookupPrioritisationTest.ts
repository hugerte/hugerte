import { describe, it } from '@ephox/bedrock-client';
import { InlineContent } from '@ephox/bridge';

import { SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import { ContextType } from 'hugerte/themes/silver/ui/context/ContextToolbar';
import { matchStartNode } from 'hugerte/themes/silver/ui/context/ContextToolbarLookup';

describe('browser.hugerte.themes.silver.editor.contexttoolbar.ContextToolbarLookupPrioritisationTest', () => {
  const createToolbar = (items: string): InlineContent.ContextToolbar => ({
    type: 'contexttoolbar',
    items,
    predicate: () => true,
    position: 'selection',
    scope: 'node'
  });

  const createForm = (): InlineContent.ContextForm => ({
    type: 'contextform',
    initValue: () => 'test',
    label: null,
    launch: null,
    commands: [{
      onAction: () => {},
      original: {
        onAction: () => {}
      },
      enabled: true,
      tooltip: null,
      icon: null,
      text: null,
      onSetup: () => () => {}
    }],
    predicate: () => true,
    position: 'selection',
    scope: 'node'
  });

  const assertMatch = (nodeCandidates: ContextType[], editorCandidates: ContextType[], expectedCandidates: ContextType[]) => {
    const elem = SugarElement.fromHtml<HTMLSpanElement>('<span>test</span>');
    matchStartNode(elem, nodeCandidates, editorCandidates).each((result) => {
      result.toolbars.forEach((t, i) =) {
        assert.equal(t, expectedCandidates[i], 'Assert toolbars are equal');
      });
    });
  };

  // requirements:
  // 1. prioritise context forms over context menus
  // 2. prioritise node scoped over editor scoped context forms
  // 3. only show max 1 context form
  // 4. concatenate all available context toolbars if no context form

  it('TINY-4495: Assert toolbar lookup prioritises forms over toolbars', () => {
    const form = createForm();
    assertMatch([ createToolbar('bold'), form ], [], [ form ]);
  });

  it('TINY-4495: Assert toolbar lookup prioritises node scoped context FORMS over editor scoped context FORMS', () => {
    const nodeScoped = [ createForm() ];
    const editorScoped = [ createForm() ];
    assertMatch(nodeScoped, editorScoped, nodeScoped);
  });

  it('TINY-4495: Assert toolbar lookup only returns one form', () => {
    const form = createForm();
    assertMatch([ form, createForm(), createForm() ], [], [ form ]);
  });

  it('TINY-4495: Assert toolbar lookup concatenates node scoped context TOOLBARS and editor scoped context TOOLBARS', () => {
    const nodeScoped = [ createToolbar('a') ];
    const editorScoped = [ createToolbar('b') ];
    assertMatch(nodeScoped, editorScoped, [ nodeScoped, editorScoped ].flat());
  });
});

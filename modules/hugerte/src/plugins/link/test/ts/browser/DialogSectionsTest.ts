import { UiFinder } from "@hugerte/agar";
import { describe, it, before, after, context } from '@ephox/bedrock-client';
import { Arr, Optional } from "@hugerte/katamari";
import { SugarBody } from "@hugerte/sugar";
import { TinyHooks } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';
import Plugin from 'hugerte/plugins/link/Plugin';

import { TestLinkUi } from '../module/TestLinkUi';

interface TestSection {
  readonly option: { key: string; value: Optional<any> };
  readonly selector: string;
  readonly exists: boolean;
}

describe('browser.hugerte.plugins.link.DialogSectionsTest', () => {
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

  const getStr = (sections: TestSection[]) => {
    const r: Record<string, string> = {};
    Arr.each(sections, (section) => {
      r[section.option.key] = section.option.value.getOr('{ default }');
    });
    return JSON.stringify(r, null, 2);
  };

  // NOTE: This will open the dialog once. It is expected that you specify all the settings that you want
  // in the sections array. Then once it has opened the dialog, it will check whether each section is
  // there or not
  const checkSections = (sections: TestSection[]) => {
    it('Settings: ' + getStr(sections), async () => {
      const editor = hook.editor();

      Arr.each(sections, ({ option }) => {
        option.value.fold(
          () => {
            editor.options.unset(option.key);
          },
          (v) => {
            editor.options.set(option.key, v);
          }
        );
      });

      await TestLinkUi.pOpenLinkDialog(editor);

      Arr.each(
        sections,
        ({ selector, exists }) => {
          // eslint-disable-next-line no-console
          console.log('selector', selector, 'exists', exists);
          const existence = exists ? UiFinder.exists : UiFinder.notExists;
          existence(SugarBody.body(), selector);
        }
      );

      await TestLinkUi.pClickCancel(editor);
    });
  };

  const checkTargetSection = (exists: boolean, value: Optional<boolean>) => {
    checkSections([
      {
        option: { key: 'link_target_list', value },
        selector: 'label:contains("Open link in...")',
        exists
      }
    ]);
  };

  const checkTitleSection = (exists: boolean, value: Optional<boolean>) => {
    checkSections([
      {
        option: { key: 'link_title', value },
        selector: 'label:contains("Title")',
        exists
      }
    ]);
  };

  const checkRelSection = (exists: boolean, value: Optional<Array<{ value: string; title: string }>>) => {
    checkSections([
      {
        option: { key: 'link_rel_list', value },
        selector: 'label:contains("Rel")',
        exists
      }
    ]);
  };

  const checkClassSection = (exists: boolean, value: Optional<Array<{ value: string; title: string }>>) => {
    checkSections([
      {
        option: { key: 'link_class_list', value },
        selector: 'label:contains("Class")',
        exists
      }
    ]);
  };

  const checkLinkListSection = (exists: boolean, value: Optional<Array<{ value: string; title: string }>>) => {
    checkSections([
      {
        option: { key: 'link_list', value },
        selector: 'label:contains("Link list")',
        exists
      }
    ]);
  };

  context('Check Target section', () => {
    checkTargetSection(false, Optional.some(false));
    checkTargetSection(true, Optional.some(true));
    checkTargetSection(true, Optional.none());
  });

  context('Check rel section', () => {
    checkRelSection(true, Optional.some([
      { title: 'a', value: 'b' },
      { title: 'c', value: 'd' }
    ]));
    checkRelSection(false, Optional.none());
  });

  context('Check Title section', () => {
    checkTitleSection(false, Optional.some(false));
    checkTitleSection(true, Optional.none());
  });

  context('Check class section', () => {
    checkClassSection(true, Optional.some([
      { title: 'a', value: 'b' },
      { title: 'c', value: 'd' }
    ]));
    checkClassSection(false, Optional.none());
  });

  context('Check LinkList section', () => {
    checkLinkListSection(true, Optional.some([
      { title: 'a', value: 'b' },
      { title: 'c', value: 'd' }
    ]));
    checkLinkListSection(false, Optional.none());
  });
});

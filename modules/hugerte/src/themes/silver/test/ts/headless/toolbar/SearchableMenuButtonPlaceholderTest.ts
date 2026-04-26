import { ApproxStructure, Assertions, Keyboard, Keys, Mouse, UiFinder } from '@ephox/agar';
import { GuiFactory, TestHelpers } from '@ephox/alloy';
import { after, before, describe, it } from '@ephox/bedrock-client';

import { SugarDocument } from '@ephox/sugar';

import I18n from 'hugerte/core/api/util/I18n';
import { renderMenuButton } from 'hugerte/themes/silver/ui/button/MenuButton';

import { fetchMailMergeData } from '../../module/CommonMailMergeFetch';
import { structMenuWith, structSearchField } from '../../module/CommonMenuTestStructures';
import * as TestExtras from '../../module/TestExtras';

describe('headless.hugerte.themes.silver.toolbar.SearchableMenuButtonPlaceholderTest', () => {
  const helpers = TestExtras.bddSetup();

  TestHelpers.GuiSetup.bddAddStyles(SugarDocument.getDocument(), [
    `.tox-menu .tox-collection__item--active {
      background-color: black;
    }`,
    `.tox-menu {
      background-color: #3f878bd6;
      color:white;
      padding: 2em;
    }`
  ]);

  // We use a random output translation to ensure that the translation
  // function is being called.
  const translateInput = 'translation-input';
  const translateOutput = '_' + Math.random().toString(36).slice(2);

  const hook = TestHelpers.GuiSetup.bddSetup(
    (store, _doc, _body) => GuiFactory.build(
      renderMenuButton(
        {
          text: 'MailMerge',
          icon: null,
          tooltip: null,
          onSetup: () => () => {},
          search: { placeholder: translateInput },
          fetch: fetchMailMergeData({
            // If a search pattern is present, collapse into one menu
            collapseSearchResults: true
          }, store)
        },
        'prefix',
        helpers.access().extras.backstages.popup,
        null
      )
    )
  );

  before(() => {
    // Adapted from the approach taken by SilverDialogBlockTest
    // to test that the block message is translated.
    I18n.add('aa', {
      [translateInput]: translateOutput
    });
    I18n.setCode('aa');
  });

  after(() => {
    I18n.setCode('en');
  });

  it('TINY-8952: Basic structure with translated placeholder', async () => {
    const menuButtonComp = hook.component();

    // Open the dropdown.
    Mouse.click(menuButtonComp.element);
    const tmenu = await UiFinder.pWaitFor(
      'Searching for TieredMenu',
      hook.body(),
      '.tox-tiered-menu'
    );

    Assertions.assertStructure(
      'Testing search field structure',
      ApproxStructure.build((s, _str, _arr) => {
        return s.element('div', {
          children: [
            structMenuWith({ selected: true }, [
              structSearchField(
                translateOutput
              ),
              // In this test, we only care about the search field.
              s.anything()
            ])
          ]
        });
      }),
      tmenu
    );

    // Close the menu
    Keyboard.activeKeystroke(hook.root(), Keys.escape(), { });
    UiFinder.notExists(hook.body(), '.tox-tiered-menu');
  });
});

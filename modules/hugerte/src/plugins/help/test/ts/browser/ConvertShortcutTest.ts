import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as ConvertShortcut from 'hugerte/plugins/help/alien/ConvertShortcut';

describe('browser.hugerte.plugins.help.ConvertShortcutTest', () => {
  // The help dialog renders these strings as HTML, so segments that are not known key
  // names or modifiers must be escaped to prevent markup injection.
  it('Escapes unmatched segments that could be interpreted as HTML', () => {
    assert.equal(ConvertShortcut.convertText('&'), '&amp;');
    assert.equal(ConvertShortcut.convertText('<'), '&lt;');
    assert.equal(ConvertShortcut.convertText('>'), '&gt;');
    assert.equal(ConvertShortcut.convertText('a&b<c>d'), 'a&amp;b&lt;c&gt;d');
    assert.equal(ConvertShortcut.convertText('<img>'), '&lt;img&gt;');
  });
});

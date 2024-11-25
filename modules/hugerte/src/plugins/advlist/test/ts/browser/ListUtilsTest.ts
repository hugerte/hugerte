import { describe, it } from '@ephox/bedrock-client';
import { SugarElement } from "@hugerte/sugar";
import { assert } from 'chai';

import { isTableCellNode, isListNode } from 'hugerte/plugins/advlist/core/ListUtils';

describe('browser.hugerte.plugins.advlist.ListUtilsTest', () => {
  it('isTableCellNode', () => {
    assert.isTrue(isTableCellNode(SugarElement.fromTag('td').dom), 'td');
    assert.isTrue(isTableCellNode(SugarElement.fromTag('th').dom), 'th');
    assert.isFalse(isTableCellNode(SugarElement.fromHtml('<div>1</div>').dom), 'invalid div');
    assert.isFalse(isTableCellNode(null));
  });

  it('isListNode', () => {
    assert.isTrue(isListNode(SugarElement.fromHtml('<ol><li>1</li></ol>').dom));
    assert.isTrue(isListNode(SugarElement.fromHtml('<ul><li>1</li></ul>').dom));
    assert.isTrue(isListNode(SugarElement.fromHtml('<dl><li>1</li></dl>').dom));
    assert.isFalse(isListNode(SugarElement.fromHtml('<div>2</div>').dom));
    assert.isFalse(isListNode(null));
  });
});

import { Waiter } from "@hugerte/agar";
import { Type } from "@hugerte/katamari";
import { Height, SugarElement, SugarLocation, Width } from "@hugerte/sugar";
import { TinyUiActions } from "@hugerte/wrap-mcagar";
import { assert } from 'chai';

import Editor from 'hugerte/core/api/Editor';
import { ToolbarMode } from 'hugerte/themes/silver/api/Options';

import { pCloseMore, pOpenMore } from './MenuUtils';

const pAssertFloatingToolbarPosition = async (editor: Editor, getTop: () => number, expectedLeft: number, expectedRight: number): Promise<void> => {
  const toolbar = await TinyUiActions.pWaitForUi(editor, '.tox-toolbar__overflow') as SugarElement<HTMLElement>;
  await Waiter.pTryUntil('Wait for toolbar position', () => {
    const top = getTop();
    const diff = 10;
    const pos = SugarLocation.absolute(toolbar);
    const right = pos.left + Width.get(toolbar);
    assert.approximately(pos.top, top, diff, `Drawer top position ${pos.top}px should be ~${top}px`);
    assert.approximately(pos.left, expectedLeft, diff, `Drawer left position ${pos.left}px should be ~${expectedLeft}px`);
    assert.approximately(right, expectedRight, diff, `Drawer right position ${right}px should be ~${expectedRight}px`);
  });
};

const pAssertFloatingToolbarHeight = async (editor: Editor, expectedHeight: number): Promise<void> => {
  const toolbar = await TinyUiActions.pWaitForUi(editor, '.tox-toolbar__overflow') as SugarElement<HTMLElement>;
  const height = Height.get(toolbar);
  assert.approximately(height, expectedHeight, 1, `Drawer height ${height}px should be ~${expectedHeight}px`);
};

const pOpenFloatingToolbarAndAssertPosition = async (editor: Editor, getTop: () => number, pActions?: () => Promise<void>): Promise<void> => {
  await pOpenMore(ToolbarMode.floating);
  await pAssertFloatingToolbarPosition(editor, getTop, 105, 531);
  if (Type.isNonNullable(pActions)) {
    await pActions();
  }
  await pCloseMore(ToolbarMode.floating);
};

export {
  pAssertFloatingToolbarHeight,
  pAssertFloatingToolbarPosition,
  pOpenFloatingToolbarAndAssertPosition
};

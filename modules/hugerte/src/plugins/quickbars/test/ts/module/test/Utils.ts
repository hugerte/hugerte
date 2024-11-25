import { UiFinder, Waiter } from "@hugerte/agar";
import { SugarBody } from "@hugerte/sugar";

const toolbarSelector = '.tox-pop__dialog .tox-toolbar';

const pAssertToolbarNotVisible = (): Promise<void> =>
  Waiter.pTryUntil('toolbar should not exist', () => UiFinder.notExists(SugarBody.body(), toolbarSelector));

const pAssertToolbarVisible = (): Promise<void> =>
  Waiter.pTryUntil('toolbar should exist', () => UiFinder.exists(SugarBody.body(), toolbarSelector));

export {
  pAssertToolbarNotVisible,
  pAssertToolbarVisible
};

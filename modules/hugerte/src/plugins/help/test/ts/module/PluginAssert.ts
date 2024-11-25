import { Assertions, Mouse, UiFinder, Waiter } from "@hugerte/agar";
import { SugarDocument } from "@hugerte/sugar";

export const pAssert = async (message: string, expected: Record<string, number>, waitOnSelector: string, clickOnSelector: string): Promise<void> => {
  const dialog = await UiFinder.pWaitFor('Could not find dialog', SugarDocument.getDocument(), waitOnSelector);
  Mouse.clickOn(dialog, clickOnSelector);
  await Waiter.pTryUntil(
    'Waiting for expected structure',
    () => Assertions.assertPresence(message, expected, dialog)
  );
};

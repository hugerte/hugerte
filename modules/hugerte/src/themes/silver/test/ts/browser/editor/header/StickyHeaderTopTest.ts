import { describe } from '@ephox/bedrock-client';

import { ToolbarLocation, ToolbarMode } from 'hugerte/themes/silver/api/Options';

import { testStickyHeader } from '../../../module/StickyHeaderStep';

describe('browser.hugerte.themes.silver.editor.header.StickyHeaderTopTest', () => {
  testStickyHeader(ToolbarMode.default, ToolbarLocation.top);
  testStickyHeader(ToolbarMode.floating, ToolbarLocation.top);
  testStickyHeader(ToolbarMode.sliding, ToolbarLocation.top);
});

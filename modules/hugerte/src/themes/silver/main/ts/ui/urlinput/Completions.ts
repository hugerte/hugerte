import { Menu as BridgeMenu } from '@ephox/bridge';

import { LinkInformation } from '../../backstage/UrlInputBackstage';
import { LinkTarget, LinkTargetType } from '../core/LinkTargets';
import { SingleMenuItemSpec } from '../menus/menu/SingleMenuTypes';

const separator: BridgeMenu.SeparatorMenuItemSpec = {
  type: 'separator'
};

const toMenuItem = (target: LinkTarget): BridgeMenu.MenuItemSpec => ({
  type: 'menuitem',
  value: target.url,
  text: target.title,
  meta: {
    attach: target.attach
  },
  onAction: () => {}
});

const staticMenuItem = (title: string, url: string): BridgeMenu.MenuItemSpec => ({
  type: 'menuitem',
  value: url,
  text: title,
  meta: {
    attach: undefined
  },
  onAction: () => {}
});

const toMenuItems = (targets: LinkTarget[]): BridgeMenu.MenuItemSpec[] =>
  (targets).map(toMenuItem);

const filterLinkTargets = (type: LinkTargetType, targets: LinkTarget[]): LinkTarget[] =>
  (targets).filter((target) => target.type === type);

const filteredTargets = (type: LinkTargetType, targets: LinkTarget[]): BridgeMenu.MenuItemSpec[] =>
  toMenuItems(filterLinkTargets(type, targets));

const headerTargets = (linkInfo: LinkInformation): BridgeMenu.MenuItemSpec[] =>
  filteredTargets('header', linkInfo.targets);

const anchorTargets = (linkInfo: LinkInformation): BridgeMenu.MenuItemSpec[] =>
  filteredTargets('anchor', linkInfo.targets);

const anchorTargetTop = (linkInfo: LinkInformation): BridgeMenu.MenuItemSpec[] =>
  (linkInfo.anchorTop ?? null).map((url) => staticMenuItem('<top>', url)).toArray();

const anchorTargetBottom = (linkInfo: LinkInformation): BridgeMenu.MenuItemSpec[] =>
  (linkInfo.anchorBottom ?? null).map((url) => staticMenuItem('<bottom>', url)).toArray();

const historyTargets = (history: string[]): BridgeMenu.MenuItemSpec[] =>
  (history).map((url) => staticMenuItem(url, url));

const joinMenuLists = (items: BridgeMenu.MenuItemSpec[][]): SingleMenuItemSpec[] => {
  return (items).reduce((a, b) => {
    const bothEmpty = a.length === 0 || b.length === 0;
    return bothEmpty ? a.concat(b) : a.concat(separator, b);
  }, [] as SingleMenuItemSpec[]);
};

const filterByQuery = (term: string, menuItems: BridgeMenu.MenuItemSpec[]): BridgeMenu.MenuItemSpec[] => {
  const lowerCaseTerm = term.toLowerCase();
  return (menuItems).filter((item) => {
    const text = item.meta !== undefined && item.meta.text !== undefined ? item.meta.text : item.text;
    const value = item.value ?? '';
    return (text.toLowerCase()).includes(lowerCaseTerm) || (value.toLowerCase()).includes(lowerCaseTerm);
  });
};

export {
  separator,
  toMenuItem,
  staticMenuItem,
  toMenuItems,
  filterLinkTargets,
  filteredTargets,
  headerTargets,
  anchorTargets,
  anchorTargetTop,
  anchorTargetBottom,
  historyTargets,
  joinMenuLists,
  filterByQuery
};

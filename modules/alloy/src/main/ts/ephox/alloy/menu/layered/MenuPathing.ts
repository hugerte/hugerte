import { Obj } from '@ephox/katamari';

// Not enforced :( Just for readability.
type TriggerItemToMenu = Record<string, string>;
type MenuToTriggerItem = Record<string, string>;
type MenuToItems = Record<string, string[]>;
type ItemToMenu = Record<string, string>;

type ItemToMenuPath = Record<string, string[]>;

const transpose = (obj: Record<string, string>): Record<string, string> =>
  // Assumes no duplicate fields.
  Obj.tupleMap(obj, (v, k) => ({ k: v, v: k }));
const trace = (items: Record<string, string>, byItem: TriggerItemToMenu, byMenu: MenuToTriggerItem, finish: string): string[] =>
  // Given a finishing submenu (which will be the value of expansions),
  // find the triggering item, find its menu, and repeat the process. If there
  // is no triggering item, we are done.
  ((byMenu)[finish] ?? null).bind((triggerItem: string) => ((items)[triggerItem] ?? null).bind((triggerMenu: string) => {
    const rest = trace(items, byItem, byMenu, triggerMenu);
    return [ triggerMenu ].concat(rest);
  })) ?? ([ ]);

const generate = (menus: MenuToItems, expansions: TriggerItemToMenu): ItemToMenuPath => {
  const items: ItemToMenu = { };
  Object.entries(menus).forEach(([_k, _v]: [any, any]) => ((menuItems, menu) => {
    (menuItems).forEach((item) => {
      items[item] = menu;
    });
  })(_v, _k));

  const byItem: TriggerItemToMenu = expansions;
  const byMenu: MenuToTriggerItem = transpose(expansions);

  // For each menu, calculate the backlog of submenus to get to it.
  const menuPaths = Object.fromEntries(Object.entries(byMenu).map(([_k, _v]: [any, any]) => [_k, ((_triggerItem: string, submenu: string) => [ submenu ].concat(trace(items, byItem, byMenu, submenu)))(_v, _k as any)]));

  return Object.fromEntries(Object.entries(items).map(([_k, _v]: [any, any]) => [_k, ((menu: string) => ((menuPaths)[menu] ?? null) ?? ([ menu ]))(_v, _k as any)]));
};

export {
  generate
};

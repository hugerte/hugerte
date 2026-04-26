import { Arr, Cell, Obj, Singleton } from '@ephox/katamari';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { MenuPreparation } from '../../ui/single/TieredMenuSpec';
import * as MenuPathing from './MenuPathing';

// Object indexed by menu value. Each entry has a list of item values.
export type MenuDirectory = Record<string, string[]>;

// A tuple of (item, menu). This can be used to refresh the menu and position them next to the right
// triggering items.
export interface LayeredItemTrigger {
  readonly triggeringItem: AlloyComponent;
  readonly triggeredMenu: AlloyComponent;
  readonly triggeringPath: string[];
}

export interface LayeredState {
  setContents: (sPrimary: string, sMenus: Record<string, MenuPreparation>, sExpansions: Record<string, string>, dir: MenuDirectory) => void;
  setMenuBuilt: (menuName: string, built: AlloyComponent) => void;
  expand: (itemValue: string) => (string[]) | null;
  refresh: (itemValue: string) => (string[]) | null;
  collapse: (itemValue: string) => (string[]) | null;
  lookupMenu: (menuValue: string) => (MenuPreparation) | null;
  lookupItem: (itemValue: string) => (string) | null;
  otherMenus: (path: string[]) => string[];
  getPrimary: () => (AlloyComponent) | null;
  getMenus: () => Record<string, MenuPreparation>;
  clear: () => void;
  isClear: () => boolean;
  getTriggeringPath: (itemValue: string, getItemByValue: (itemValue: string) => (AlloyComponent) | null) => (LayeredItemTrigger[]) | null;
}

const init = (): LayeredState => {
  const expansions: Cell<Record<string, string>> = Cell({ });
  const menus: Cell<Record<string, MenuPreparation>> = Cell({ });
  const paths: Cell<Record<string, string[]>> = Cell({ });
  const primary = Singleton.value<string>();

  // Probably think of a better way to store this information.
  const directory: Cell<MenuDirectory> = Cell({ });

  const clear = (): void => {
    expansions.set({});
    menus.set({});
    paths.set({});
    primary.clear();
  };

  const isClear = (): boolean => primary.get() === null;

  const setMenuBuilt = (menuName: string, built: AlloyComponent) => {
    menus.set({
      ...menus.get(),
      [menuName]: {
        type: 'prepared',
        menu: built
      }
    });
  };

  const setContents = (sPrimary: string, sMenus: Record<string, MenuPreparation>, sExpansions: Record<string, string>, dir: MenuDirectory): void => {
    primary.set(sPrimary);
    expansions.set(sExpansions);
    menus.set(sMenus);
    directory.set(dir);
    const sPaths = MenuPathing.generate(dir, sExpansions);
    paths.set(sPaths);
  };

  const getTriggeringItem = (menuValue: string): (string) | null => Obj.find(expansions.get(), (v, _k) => v === menuValue);

  const getTriggerData = (menuValue: string, getItemByValue: (v: string) => (AlloyComponent) | null, path: string[]): (LayeredItemTrigger) | null =>
    getPreparedMenu(menuValue).bind((menu) => getTriggeringItem(menuValue).bind((triggeringItemValue) => getItemByValue(triggeringItemValue).map((triggeredItem) => ({
      triggeredMenu: menu,
      triggeringItem: triggeredItem,
      triggeringPath: path
    }))));

  const getTriggeringPath = (itemValue: string, getItemByValue: (v: string) => (AlloyComponent) | null): (LayeredItemTrigger[]) | null => {
    // Get the path up to the last item
    const extraPath: string[] = (lookupItem(itemValue).toArray()).filter((menuValue) => getPreparedMenu(menuValue) !== null);

    return ((paths.get())[itemValue] ?? null).bind((path) => {
      // remember the path is [ most-recent-menu, next-most-recent-menu ]
      // convert each menu identifier into { triggeringItem: comp, menu: comp }

      // could combine into a fold ... probably a left to reverse ... but we'll take the
      // straightforward version when prototyping
      const revPath = [...(extraPath.concat(path))].reverse();

      const triggers: Array<(LayeredItemTrigger) | null> = Arr.bind(revPath, (menuValue, menuIndex) =>
        // finding menuValue, it should match the trigger
        getTriggerData(menuValue, getItemByValue, revPath.slice(0, menuIndex + 1)).fold(
          () => (primary.get() !== null && (primary.get()) === (menuValue)) ? [ ] : [ null ],
          (data) => [ data ]
        )
      );

      // Convert List<(X) | null> to (List<X>) | null if ALL are Some
      return ((triggers).every((_x: any) => _x !== null) ? (triggers) as any[] : null);
    });
  };

  // Given an item, return a list of all menus including the one that it triggered (if there is one)
  const expand = (itemValue: string): (string[]) | null => ((expansions.get())[itemValue] ?? null).map((menu: string) => {
    const current: string[] = ((paths.get())[itemValue] ?? null) ?? ([ ]);
    return [ menu ].concat(current);
  });

  const collapse = (itemValue: string): (string[]) | null =>
    // Look up which key has the itemValue
    ((paths.get())[itemValue] ?? null).bind((path) => path.length > 1 ? path.slice(1) : null);

  const refresh = (itemValue: string): (string[]) | null => ((paths.get())[itemValue] ?? null);

  const getPreparedMenu = (menuValue: string): (AlloyComponent) | null => lookupMenu(menuValue).bind(extractPreparedMenu);

  const lookupMenu = (menuValue: string): (MenuPreparation) | null => ((menus.get())[menuValue] ?? null);

  const lookupItem = (itemValue: string): (string) | null => ((expansions.get())[itemValue] ?? null);

  const otherMenus = (path: string[]): string[] => {
    const menuValues = directory.get();
    return (Object.keys(menuValues)).filter((_x: any) => !(path).includes(_x));
  };

  const getPrimary = (): (AlloyComponent) | null => primary.get().bind(getPreparedMenu);

  const getMenus = (): Record<string, MenuPreparation> => menus.get();

  return {
    setMenuBuilt,
    setContents,
    expand,
    refresh,
    collapse,
    lookupMenu,
    lookupItem,
    otherMenus,
    getPrimary,
    getMenus,
    clear,
    isClear,
    getTriggeringPath
  };
};

const extractPreparedMenu = (prep: MenuPreparation): (AlloyComponent) | null => prep.type === 'prepared' ? prep.menu : null;

export const LayeredState = {
  init,
  extractPreparedMenu
};

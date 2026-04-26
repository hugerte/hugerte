
import Editor from 'hugerte/core/api/Editor';
import { Menu } from 'hugerte/core/api/ui/Ui';

import * as Options from '../../../api/Options';
import { MenubarItemSpec } from './SilverMenubar';

interface MenuSpec {
  readonly title: string;
  readonly items: string;
}

export interface MenuRegistry {
  readonly menuItems: Record<string, Menu.MenuItemSpec | Menu.NestedMenuItemSpec | Menu.ToggleMenuItemSpec>;
  readonly menubar: string | boolean;
  readonly menus: Record<string, MenuSpec>;
}

const defaultMenubar = 'file edit view insert format tools table help';

const defaultMenus: Record<string, MenuSpec> = {
  file: { title: 'File', items: 'newdocument restoredraft | preview | importword exportpdf exportword | export print | deleteallconversations' },
  edit: { title: 'Edit', items: 'undo redo | cut copy paste pastetext | selectall | searchreplace' },
  view: { title: 'View', items: 'code revisionhistory | visualaid visualchars visualblocks | spellchecker | preview fullscreen | showcomments' },
  insert: { title: 'Insert', items: 'image link media addcomment pageembed template inserttemplate codesample inserttable accordion | charmap emoticons hr | pagebreak nonbreaking anchor tableofcontents footnotes | mergetags | insertdatetime' },
  format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript codeformat | styles blocks fontfamily fontsize align lineheight | forecolor backcolor | language | removeformat' },
  tools: { title: 'Tools', items: 'aidialog aishortcuts | spellchecker spellcheckerlanguage | autocorrect capitalization | a11ycheck code typography wordcount addtemplate' },
  table: { title: 'Table', items: 'inserttable | cell row column | advtablesort | tableprops deletetable' },
  help: { title: 'Help', items: 'help' }
};

const make = (menu: { title: string; items: string[] }, registry: MenuRegistry, editor: Editor): MenubarItemSpec => {
  const removedMenuItems = Options.getRemovedMenuItems(editor).split(/[ ,]/);
  return {
    text: menu.title,
    getItems: () => (menu.items).flatMap((i): Menu.NestedMenuItemContents[] => {
      const itemName = i.toLowerCase();
      if (itemName.trim().length === 0) {
        return [];
      } else if ((removedMenuItems).some((removedMenuItem) => removedMenuItem === itemName)) {
        return [];
      } else if (itemName === 'separator' || itemName === '|') {
        return [{
          type: 'separator'
        }];
      } else if (registry.menuItems[itemName]) {
        return [ registry.menuItems[itemName] ];
      } else {
        return [];
      }
    })
  };
};

const parseItemsString = (items: string): string[] => {
  return items.split(' ');
};

const identifyMenus = (editor: Editor, registry: MenuRegistry): MenubarItemSpec[] => {
  const rawMenuData = { ...defaultMenus, ...registry.menus };
  const userDefinedMenus = Object.keys(registry.menus).length > 0;

  const menubar: string[] = registry.menubar === undefined || registry.menubar === true ? parseItemsString(defaultMenubar) : parseItemsString(registry.menubar === false ? '' : registry.menubar);
  const validMenus = (menubar).filter((menuName) => {
    const isDefaultMenu = Object.prototype.hasOwnProperty.call(defaultMenus, menuName);
    if (userDefinedMenus) {
      return isDefaultMenu || ((registry.menus)[menuName] ?? null).exists((menu) => Object.prototype.hasOwnProperty.call(menu, 'items'));
    } else {
      return isDefaultMenu;
    }
  });

  const menus: MenubarItemSpec[] = (validMenus).map((menuName) => {
    const menuData = rawMenuData[menuName];
    return make({ title: menuData.title, items: parseItemsString(menuData.items) }, registry, editor);
  });

  return (menus).filter((menu) => {
    // Filter out menus that have no items, or only separators
    const isNotSeparator = (item: Menu.NestedMenuItemContents) => typeof (item) === 'string' || item.type !== 'separator';
    return menu.getItems().length > 0 && (menu.getItems()).some(isNotSeparator);
  });
};

export { identifyMenus };

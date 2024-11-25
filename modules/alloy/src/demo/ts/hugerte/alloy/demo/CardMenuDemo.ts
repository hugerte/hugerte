import { Objects } from "@hugerte/boulder";
import { Optional } from "@hugerte/katamari";
import { Class, SelectorFind, SugarElement, Width } from "@hugerte/sugar";

import * as Behaviour from "hugerte/alloy/api/behaviour/Behaviour";
import { Transitioning } from "hugerte/alloy/api/behaviour/Transitioning";
import { AlloyComponent } from "hugerte/alloy/api/component/ComponentApi";
import * as Attachment from "hugerte/alloy/api/system/Attachment";
import * as Gui from "hugerte/alloy/api/system/Gui";
import { Menu } from "hugerte/alloy/api/ui/Menu";
import { tieredMenu as TieredMenu } from "hugerte/alloy/api/ui/TieredMenu";
import * as HtmlDisplay from "hugerte/alloy/demo/HtmlDisplay";
import { ItemSpec } from "hugerte/alloy/ui/types/ItemTypes";
import { HighlightOnOpen } from "hugerte/alloy/ui/types/TieredMenuTypes";

/* eslint-disable no-console */

export default (): void => {
  const gui = Gui.create();
  const body = SugarElement.fromDom(document.body);
  Class.add(gui.element, 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  const makeBack = (text: string): ItemSpec => ({
    data: TieredMenu.collapseItem(text),
    type: 'item',
    dom: {
      tag: 'div',
      innerHtml: text
    },
    components: [ ]
  });

  const makeItem = (value: string, text: string): ItemSpec => ({
    data: {
      value
    },
    type: 'item',
    dom: {
      tag: 'div',
      innerHtml: text
    },
    components: [ ]
  });

  const makeSeparator = (text: string) => ({
    type: 'separator',
    dom: {
      tag: 'div',
      classes: [ 'separator' ]
    },
    components: [
      {
        dom: {
          tag: 'strong',
          innerHtml: text
        }
      }
    ]
  });

  const makeMenu = (value: string, items: ItemSpec[]) => ({
    value,
    dom: {
      tag: 'div'
    },
    components: [
      Objects.exclude(makeSeparator(value), [ 'type' ]),
      {
        dom: {
          tag: 'div',
          classes: [ 'menu-items-container' ]
        },
        components: [
          Menu.parts.items({ })
        ]
      }
    ],
    items,
    menuBehaviours: Behaviour.derive([
      Transitioning.config({
        initialState: 'after',
        routes: Transitioning.createTristate('before', 'current', 'after', {
          transition: {
            property: 'transform',
            transitionClass: 'transitioning'
          }
        })
      })
    ])
  });

  // https://jsfiddle.net/xuto3by2/1/
  const tieredMenu = TieredMenu.sketch({
    dom: {
      tag: 'div',
      classes: [ 'demo-tiered-menu' ]
    },
    components: [

    ],

    // Focus causes issues when the things being focused are offscreen.
    fakeFocus: true,
    // For animations, need things to stay around in the DOM (at least until animation is done)
    stayInDom: true,

    onExecute: () => {
      console.log('Executing');
      return Optional.some<boolean>(true);
    },
    onEscape: () => {
      console.log('Escaping');
      return Optional.some<boolean>(true);
    },
    onOpenMenu: (container: AlloyComponent, menu: AlloyComponent) => {
      const w = Width.get(container.element);
      Width.set(menu.element, w);
      if (Transitioning.jumpTo) {
        Transitioning.jumpTo(menu, 'current');
      }
    },
    onOpenSubmenu: (container, item, submenu) => {
      const w = Width.get(container.element);
      const menu = SelectorFind.ancestor(item.element, '[role="menu"]').getOrDie('hacky');
      const menuComp = container.getSystem().getByDom(menu).getOrDie();
      Width.set(submenu.element, w);

      if (Transitioning.progressTo && Transitioning.jumpTo) {
        Transitioning.progressTo(menuComp, 'before');
        Transitioning.jumpTo(submenu, 'after');
        Transitioning.progressTo(submenu, 'current');
      }
    },

    onCollapseMenu: (container, item, menu) => {
      const submenu = SelectorFind.ancestor(item.element, '[role="menu"]').getOrDie('hacky');
      const submenuComp = container.getSystem().getByDom(submenu).getOrDie();
      if (Transitioning.progressTo) {
        Transitioning.progressTo(submenuComp, 'after');
        Transitioning.progressTo(menu, 'current');
      }
    },

    navigateOnHover: false,

    highlightOnOpen: HighlightOnOpen.HighlightMenuAndItem,
    data: TieredMenu.tieredData(
      'styles',
      {
        styles: makeMenu('Styles', [
          makeItem('headers', 'Headers'),
          makeItem('inline', 'Inline'),
          makeItem('blocks', 'Blocks'),
          makeItem('alignment', 'Alignment')
        ]),

        headers: makeMenu('Headers', [
          makeBack('< Back'),
          makeItem('h1', 'Heading 1'),
          makeItem('h2', 'Heading 2'),
          makeItem('h3', 'Heading 3')
        ]),

        inline: makeMenu('Inline', [
          makeBack('< Back'),
          makeItem('bold', 'Bold'),
          makeItem('italic', 'Italic')
        ]),

        blocks: makeMenu('Blocks', [
          makeBack('< Back'),
          makeItem('p', 'Paragraph'),
          makeItem('blockquote', 'Blockquote'),
          makeItem('div', 'Div')
        ]),

        alignment: makeMenu('Alignment', [
          makeBack('< Back'),
          makeItem('alignleft', 'Left')
        ])
      },
      {
        headers: 'headers',
        inline: 'inline',
        blocks: 'blocks',
        alignment: 'alignment'
      }
    ),

    markers: {
      backgroundMenu: 'background-menu',
      menu: 'menu',
      selectedMenu: 'selected-menu',
      item: 'item',
      selectedItem: 'selected-item'
    }
  });

  HtmlDisplay.section(
    gui,
    'This menu is a card menu',
    tieredMenu
  );
};

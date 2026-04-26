import {
  AlloyComponent, AlloySpec, Behaviour, Dropdown as AlloyDropdown, Layouts, RawDomSchema, SketchSpec, Tabstopping, Unselecting
} from '@ephox/alloy';
import { Menu, Toolbar } from '@ephox/bridge';
import { Future, Merger } from '@ephox/katamari';

import { UiFactoryBackstageShared } from '../../backstage/Backstage';
import * as ReadOnly from '../../ReadOnly';
import { DisablingConfigs } from '../alien/DisablingConfigs';
import ItemResponse from '../menus/item/ItemResponse';
import { createPartialChoiceMenu } from '../menus/menu/MenuChoice';
import { deriveMenuMovement } from '../menus/menu/MenuMovement';
import * as MenuParts from '../menus/menu/MenuParts';
import { createTieredDataFrom } from '../menus/menu/SingleMenu';

export interface SwatchPanelButtonSpec {
  readonly dom: RawDomSchema;
  readonly components: AlloySpec[];
  readonly fetch: (callback: (value: Menu.ChoiceMenuItemSpec[]) => void) => void;
  readonly columns: number;
  readonly presets: Toolbar.PresetTypes;
  readonly getHotspot?: (comp: AlloyComponent) => (AlloyComponent) | null;
  readonly onItemAction: (comp: AlloyComponent, value: string) => void;
  readonly layouts?: Layouts;
}

export const renderPanelButton = (spec: SwatchPanelButtonSpec, sharedBackstage: UiFactoryBackstageShared): SketchSpec => AlloyDropdown.sketch({
  dom: spec.dom,
  components: spec.components,

  toggleClass: 'mce-active',

  dropdownBehaviours: Behaviour.derive([
    DisablingConfigs.button(sharedBackstage.providers.isDisabled),
    ReadOnly.receivingConfig(),
    Unselecting.config({}),
    Tabstopping.config({})
  ]),
  layouts: spec.layouts,
  sandboxClasses: [ 'tox-dialog__popups' ],

  lazySink: sharedBackstage.getSink,
  fetch: (comp) => Future.nu((callback) => spec.fetch(callback)).map((items) => (createTieredDataFrom(
    Merger.deepMerge(
      createPartialChoiceMenu(
        (('menu-value') + '_' + Math.floor(Math.random() * 1e9) + Date.now()),
        items,
        (value) => {
          spec.onItemAction(comp, value);
        },
        spec.columns,
        spec.presets,
        ItemResponse.CLOSE_ON_EXECUTE,
        // No colour is ever selected on opening
        (() => false as const),
        sharedBackstage.providers
      ),
      {
        movement: deriveMenuMovement(spec.columns, spec.presets)
      }
    )
  ) ?? null)),

  parts: {
    menu: MenuParts.part(false, 1, spec.presets)
  }
});

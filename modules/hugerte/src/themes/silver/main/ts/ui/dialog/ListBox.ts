import {
  AlloyComponent, AlloySpec, AlloyTriggers, Behaviour, Disabling, Focusing, FormField as AlloyFormField, Representing, SimpleSpec, SketchSpec,
  Tabstopping
} from '@ephox/alloy';
import { Dialog, Menu as BridgeMenu } from '@ephox/bridge';
import { Arr, Obj } from '@ephox/katamari';
import { Attribute } from '@ephox/sugar';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { renderLabel } from '../alien/FieldLabeller';
import * as RepresentingConfigs from '../alien/RepresentingConfigs';
import { renderCommonDropdown, updateMenuText } from '../dropdown/CommonDropdown';
import { formChangeEvent } from '../general/FormEvents';
import ItemResponse from '../menus/item/ItemResponse';
import * as NestedMenus from '../menus/menu/NestedMenus';

type ListBoxSpec = Omit<Dialog.ListBox, 'type'>;

const isSingleListItem = (item: Dialog.ListBoxItemSpec): item is Dialog.ListBoxSingleItemSpec => !Obj.has(item as Record<string, any>, 'items');

const dataAttribute = 'data-value';

const fetchItems = (dropdownComp: AlloyComponent, name: string, items: Dialog.ListBoxItemSpec[], selectedValue: string): Array<BridgeMenu.ToggleMenuItemSpec | BridgeMenu.NestedMenuItemSpec> =>
  (items).map((item) => {
    if (!isSingleListItem(item)) {
      return {
        type: 'nestedmenuitem',
        text: item.text,
        getSubmenuItems: () => fetchItems(dropdownComp, name, item.items, selectedValue)
      };
    } else {
      return {
        type: 'togglemenuitem',
        text: item.text,
        value: item.value,
        active: item.value === selectedValue,
        onAction: () => {
          Representing.setValue(dropdownComp, item.value);
          AlloyTriggers.emitWith(dropdownComp, formChangeEvent, { name } );
          Focusing.focus(dropdownComp);
        }
      };
    }
  });

const findItemByValue = (items: Dialog.ListBoxItemSpec[], value: string): (Dialog.ListBoxSingleItemSpec) | null =>
  Arr.findMap(items, (item) => {
    if (!isSingleListItem(item)) {
      return findItemByValue(item.items, value);
    } else {
      return (item.value === value ? item : null);
    }
  });

export const renderListBox = (spec: ListBoxSpec, backstage: UiFactoryBackstage, initialData: (string) | null): SketchSpec => {
  const providersBackstage = backstage.shared.providers;
  const initialItem = initialData
    .bind((value) => findItemByValue(spec.items, value))
    .orThunk(() => ((spec.items)[0] ?? null).filter(isSingleListItem));

  const pLabel = spec.label.map((label) => renderLabel(label, providersBackstage));

  const pField = AlloyFormField.parts.field({
    dom: { },
    factory: {
      sketch: (sketchSpec: SketchSpec) => renderCommonDropdown({
        uid: sketchSpec.uid,
        text: initialItem.map((item) => item.text),
        icon: null,
        tooltip: null,
        role: null,
        ariaLabel: spec.label,
        fetch: (comp, callback) => {
          const items = fetchItems(comp, spec.name, spec.items, Representing.getValue(comp));
          callback(
            NestedMenus.build(
              items,
              ItemResponse.CLOSE_ON_EXECUTE,
              backstage,
              {
                isHorizontalMenu: false,
                search: null
              }
            )
          );
        },
        onSetup: () => () => {},
        getApi: () => { },
        columns: 1,
        presets: 'normal',
        classes: [],
        dropdownBehaviours: [
          Tabstopping.config({}),
          RepresentingConfigs.withComp(
            initialItem.map((item) => item.value),
            (comp) => Attribute.get(comp.element, dataAttribute),
            (comp, data) => {
              // We only want to update the saved value if the value set is a valid property
              findItemByValue(spec.items, data)
                .each((item) => {
                  Attribute.set(comp.element, dataAttribute, item.value);
                  AlloyTriggers.emitWith(comp, updateMenuText, { text: item.text });
                });
            }
          )
        ]
      },
      'tox-listbox',
      backstage.shared)
    }
  });

  const listBoxWrap: SimpleSpec = {
    dom: {
      tag: 'div',
      classes: [ 'tox-listboxfield' ]
    },
    components: [ pField ]
  };

  return AlloyFormField.sketch({
    dom: {
      tag: 'div',
      classes: [ 'tox-form__group' ]
    },
    components: Arr.flatten<AlloySpec>([ pLabel.toArray(), [ listBoxWrap ]]),
    fieldBehaviours: Behaviour.derive([
      Disabling.config({
        disabled: () => !spec.enabled,
        onDisabled: (comp) => {
          AlloyFormField.getField(comp).each(Disabling.disable);
        },
        onEnabled: (comp) => {
          AlloyFormField.getField(comp).each(Disabling.enable);
        }
      })
    ])
  });
};

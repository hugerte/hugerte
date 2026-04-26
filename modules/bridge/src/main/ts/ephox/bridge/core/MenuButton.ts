import { FieldSchema, StructureSchema, ValueType } from '@ephox/boulder';

import { NestedMenuItemContents } from '../components/menu/NestedMenuItem';

export type MenuButtonItemTypes = NestedMenuItemContents;
export type SuccessCallback = (menu: string | MenuButtonItemTypes[]) => void;

// NOTE: MenuButtonFetchContext is an object so that we can add information to it in the future.
export interface MenuButtonFetchContext {
  pattern: string;
}

export interface BaseMenuButtonSpec {
  text?: string;
  tooltip?: string;
  icon?: string;
  search?: boolean | { placeholder?: string };
  // In order to avoid breaking APIs with pre 6.2 releases, the fetchContext was added
  // as an additional argument to fetch.
  fetch: (success: SuccessCallback, fetchContext: MenuButtonFetchContext, api: BaseMenuButtonInstanceApi) => void;
  onSetup?: (api: BaseMenuButtonInstanceApi) => (api: BaseMenuButtonInstanceApi) => void;
}

export interface BaseMenuButton {
  text: (string) | null;
  tooltip: (string) | null;
  icon: (string) | null;
  search: ({ placeholder: (string) | null }) | null;
  fetch: (success: SuccessCallback, fetchContext: MenuButtonFetchContext, api: BaseMenuButtonInstanceApi) => void;
  onSetup: (api: BaseMenuButtonInstanceApi) => (api: BaseMenuButtonInstanceApi) => void;
}

export interface BaseMenuButtonInstanceApi {
  isEnabled: () => boolean;
  setEnabled: (state: boolean) => void;
  isActive: () => boolean;
  setActive: (state: boolean) => void;
  setText: (text: string) => void;
  setIcon: (icon: string) => void;
}

export const baseMenuButtonFields = [
  FieldSchema.optionString('text'),
  FieldSchema.optionString('tooltip'),
  FieldSchema.optionString('icon'),

  FieldSchema.defaultedOf(
    'search',
    false,

    // So our boulder validation are:
    // a) boolean -> we need to map it into an Option
    // b) object -> we need to map it into a Some
    StructureSchema.oneOf(
      [
        // Unfortunately, due to objOf not checking to see that the
        // input is an object, the boolean check MUST be first
        ValueType.boolean,
        StructureSchema.objOf([
          FieldSchema.optionString('placeholder')
        ])
      ],

      // This function allows you to standardise the output.
      (x: boolean | { placeholder: (string) | null }): BaseMenuButton['search'] => {
        if (typeof (x) === 'boolean') {
          return x ? { placeholder: null } : null;
        } else {
          return x;
        }
      }
    )
  ),

  FieldSchema.requiredFunction('fetch'),
  FieldSchema.defaultedFunction('onSetup', () => () => {})
];

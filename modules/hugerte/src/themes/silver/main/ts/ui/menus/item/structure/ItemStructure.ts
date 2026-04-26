import { AlloySpec, RawDomSchema } from '@ephox/alloy';
import { Toolbar } from '@ephox/bridge';

import I18n from 'hugerte/core/api/util/I18n';

import { UiFactoryBackstageProviders } from '../../../../backstage/Backstage';
import * as Icons from '../../../icons/Icons';
import * as ItemClasses from '../ItemClasses';
import { renderHtml, renderShortcut, renderStyledText, renderText } from './ItemSlices';

export interface ItemStructure {
  readonly dom: RawDomSchema;
  readonly optComponents: Array<(AlloySpec) | null>;
}

export interface ItemStructureSpec {
  readonly presets: Toolbar.PresetItemTypes;
  readonly iconContent: (string) | null;
  readonly textContent: (string) | null;
  readonly htmlContent: (string) | null;
  readonly ariaLabel: (string) | null;
  readonly shortcutContent: (string) | null;
  readonly checkMark: (AlloySpec) | null;
  readonly caret: (AlloySpec) | null;
  readonly value?: string;
  readonly meta?: Record<string, any>;
}

const renderColorStructure = (item: ItemStructureSpec, providerBackstage: UiFactoryBackstageProviders, fallbackIcon: (string) | null): ItemStructure => {
  const colorPickerCommand = 'custom';
  const removeColorCommand = 'remove';

  const itemValue = item.value;
  const iconSvg = item.iconContent.map((name) => Icons ?? name, providerBackstage.icons, fallbackIcon);

  const attributes = item.ariaLabel.map(
    (al) => ({
      'aria-label': providerBackstage.translate(al),
      'data-mce-name': al
    })
  ) ?? ({ });

  const getDom = (): RawDomSchema => {
    const common = ItemClasses.colorClass;
    const icon = iconSvg ?? ('');

    const baseDom = {
      tag: 'div',
      attributes,
      classes: [ common ]
    };

    if (itemValue === colorPickerCommand) {
      return {
        ...baseDom,
        tag: 'button',
        classes: [ ...baseDom.classes, 'tox-swatches__picker-btn' ],
        innerHtml: icon
      };
    } else if (itemValue === removeColorCommand) {
      return {
        ...baseDom,
        classes: [ ...baseDom.classes, 'tox-swatch--remove' ],
        innerHtml: icon
      };
    } else if ((itemValue) != null) {
      return {
        ...baseDom,
        attributes: {
          ...baseDom.attributes,
          'data-mce-color': itemValue
        },
        styles: {
          'background-color': itemValue
        },
        innerHtml: icon
      };
    } else {
      return baseDom;
    }
  };

  return {
    dom: getDom(),
    optComponents: [ ]
  };
};

const renderItemDomStructure = (ariaLabel: (string) | null): RawDomSchema => {
  const domTitle = ariaLabel.map((label): { attributes?: { id?: string; 'aria-label': string }} => ({
    attributes: {
      'id': (('menu-item') + '_' + Math.floor(Math.random() * 1e9) + Date.now()),
      'aria-label': I18n.translate(label)
    }
  })) ?? ({});

  return {
    tag: 'div',
    classes: [ ItemClasses.navClass, ItemClasses.selectableClass ],
    ...domTitle
  };
};

const renderNormalItemStructure = (info: ItemStructureSpec, providersBackstage: UiFactoryBackstageProviders, renderIcons: boolean, fallbackIcon: (string) | null): ItemStructure => {
  // TODO: TINY-3036 Work out a better way of dealing with custom icons
  const iconSpec = { tag: 'div', classes: [ ItemClasses.iconClass ] };
  const renderIcon = (iconName: string) => Icons.render(iconName, iconSpec, providersBackstage.icons, fallbackIcon);
  const renderEmptyIcon = () => { dom: iconSpec };
  // Note: renderIcons indicates if any icons are present in the menu - if false then the icon column will not be present for the whole menu
  const leftIcon = renderIcons ? info.iconContent.map(renderIcon).orThunk(renderEmptyIcon) : null;
  // TINY-3345: Dedicated columns for icon and checkmark if applicable
  const checkmark = info.checkMark;

  // Style items and autocompleter both have meta. Need to branch on style
  // This could probably be more stable...
  const textRender = (info.meta ?? null).fold(
    () => renderText,
    (meta) => Object.prototype.hasOwnProperty.call(meta, 'style') ? ((..._rest: any[]) => (renderStyledText)(meta.style, ..._rest)) : renderText
  );

  const content = info.htmlContent.fold(
    () => info.textContent.map(textRender),
    (html) => renderHtml(html, [ ItemClasses.textClass ])
  );

  const menuItem = {
    dom: renderItemDomStructure(info.ariaLabel),
    optComponents: [
      leftIcon,
      content,
      info.shortcutContent.map(renderShortcut),
      checkmark,
      info.caret
    ]
  };
  return menuItem;
};

// TODO: Maybe need aria-label
const renderItemStructure = (info: ItemStructureSpec, providersBackstage: UiFactoryBackstageProviders, renderIcons: boolean, fallbackIcon: (string) | null = null): ItemStructure => {
  if (info.presets === 'color') {
    return renderColorStructure(info, providersBackstage, fallbackIcon);
  } else {
    return renderNormalItemStructure(info, providersBackstage, renderIcons, fallbackIcon);
  }
};

export { renderItemStructure, renderItemDomStructure };

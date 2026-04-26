import { AlloySpec, VerticalDir } from '@ephox/alloy';
import { StructureSchema } from '@ephox/boulder';
import { Toolbar } from '@ephox/bridge';
import { Result } from '@ephox/katamari';

import Editor from 'hugerte/core/api/Editor';

import { getToolbarMode, ToolbarGroupOption, ToolbarMode } from '../../api/Options';
import { UiFactoryBackstage } from '../../backstage/Backstage';
import { ToolbarConfig } from '../../Render';
import { renderMenuButton } from '../button/MenuButton';
import { createAlignButton } from '../core/complex/AlignBespoke';
import { createBlocksButton } from '../core/complex/BlocksBespoke';
import { createFontFamilyButton } from '../core/complex/FontFamilyBespoke';
import { createFontSizeButton, createFontSizeInputButton } from '../core/complex/FontSizeBespoke';
import { createStylesButton } from '../core/complex/StylesBespoke';
import { ToolbarButtonClasses } from './button/ButtonClasses';
import { renderFloatingToolbarButton, renderSplitButton, renderToolbarButton, renderToolbarToggleButton } from './button/ToolbarButtons';
import { ToolbarGroup } from './CommonToolbar';

export type ToolbarButton = Toolbar.ToolbarButtonSpec | Toolbar.ToolbarMenuButtonSpec | Toolbar.ToolbarToggleButtonSpec | Toolbar.ToolbarSplitButtonSpec;

export interface RenderToolbarConfig {
  readonly toolbar: ToolbarConfig;
  readonly buttons: Record<string, ToolbarButton | Toolbar.GroupToolbarButtonSpec>;
  readonly allowToolbarGroups: boolean;
}

type BridgeRenderFn<S> = (spec: S, backstage: UiFactoryBackstage, editor: Editor, btnName: string) => AlloySpec;

const defaultToolbar = [
  {
    name: 'history', items: [ 'undo', 'redo' ]
  },
  {
    name: 'ai', items: [ 'aidialog', 'aishortcuts' ]
  },
  {
    name: 'styles', items: [ 'styles' ]
  },
  {
    name: 'formatting', items: [ 'bold', 'italic' ]
  },
  {
    name: 'alignment', items: [ 'alignleft', 'aligncenter', 'alignright', 'alignjustify' ]
  },
  {
    name: 'indentation', items: [ 'outdent', 'indent' ]
  },
  {
    name: 'permanent pen', items: [ 'permanentpen' ]
  },
  {
    name: 'comments', items: [ 'addcomment' ]
  }
];

const renderFromBridge = <BI, BO>(bridgeBuilder: (i: BI) => Result<BO, StructureSchema.SchemaError<any>>, render: BridgeRenderFn<BO>) =>
  (spec: BI, backstage: UiFactoryBackstage, editor: Editor, btnName: string) => {
    const internal = bridgeBuilder(spec).mapError((errInfo) => StructureSchema.formatError(errInfo)).getOrDie();
    return render(internal, backstage, editor, btnName);
  };

const types: Record<string, BridgeRenderFn<any>> = {
  button: renderFromBridge(
    Toolbar.createToolbarButton,
    (s, backstage, _, btnName) => renderToolbarButton(s, backstage.shared.providers, btnName)
  ),

  togglebutton: renderFromBridge(
    Toolbar.createToggleButton,
    (s, backstage, _, btnName) => renderToolbarToggleButton(s, backstage.shared.providers, btnName)
  ),

  menubutton: renderFromBridge(
    Toolbar.createMenuButton,
    (s, backstage, _, btnName) => renderMenuButton(s, ToolbarButtonClasses.Button, backstage, null, false, btnName)
  ),

  splitbutton: renderFromBridge(
    Toolbar.createSplitButton,
    (s, backstage, _, btnName) => renderSplitButton(s, backstage.shared, btnName)
  ),

  grouptoolbarbutton: renderFromBridge(
    Toolbar.createGroupToolbarButton,
    (s, backstage, editor, btnName) => {
      const buttons = editor.ui.registry.getAll().buttons;
      const identify = (toolbar: string | ToolbarGroupOption[]) =>
        identifyButtons(editor, { buttons, toolbar, allowToolbarGroups: false }, backstage, null);
      const attributes = {
        [VerticalDir.Attribute]: backstage.shared.header.isPositionedAtTop() ? VerticalDir.AttributeValue.TopToBottom : VerticalDir.AttributeValue.BottomToTop
      };

      switch (getToolbarMode(editor)) {
        case ToolbarMode.floating:
          return renderFloatingToolbarButton(s, backstage, identify, attributes, btnName);
        default:
          // TODO change this message and add a case when sliding is available
          throw new Error('Toolbar groups are only supported when using floating toolbar mode');
      }
    }
  )
};

const extractFrom = (spec: ToolbarButton & { type: string }, backstage: UiFactoryBackstage, editor: Editor, btnName: string): (AlloySpec) | null =>
  ((types)[spec.type] ?? null).fold(
    () => {
      // eslint-disable-next-line no-console
      console.error('skipping button defined by', spec);
      return null;
    },
    (render) => render(spec, backstage, editor, btnName)
  );

const bespokeButtons: Record<string, (editor: Editor, backstage: UiFactoryBackstage) => AlloySpec> = {
  styles: createStylesButton,
  fontsize: createFontSizeButton,
  fontsizeinput: createFontSizeInputButton,
  fontfamily: createFontFamilyButton,
  blocks: createBlocksButton,
  align: createAlignButton
};

const removeUnusedDefaults = (buttons: RenderToolbarConfig['buttons']) => {
  const filteredItemGroups = (defaultToolbar).map((group) => {
    const items = (group.items).filter((subItem) => Object.prototype.hasOwnProperty.call(buttons, subItem) || Object.prototype.hasOwnProperty.call(bespokeButtons as any, subItem));
    return {
      name: group.name,
      items
    };
  });
  return (filteredItemGroups).filter((group) => group.items.length > 0);
};

const convertStringToolbar = (strToolbar: string) => {
  const groupsStrings = strToolbar.split('|');
  return (groupsStrings).map((g) => ({
    items: g.trim().split(' ')
  }));
};

const isToolbarGroupSettingArray = (toolbar: ToolbarConfig): toolbar is ToolbarGroupOption[] =>
  (Array.isArray(toolbar) && (toolbar).every((t): t is ToolbarGroupOption => Object.prototype.hasOwnProperty.call(t, 'name') && Object.prototype.hasOwnProperty.call(t, 'items')));

// Toolbar settings
// false = disabled
// undefined or true = default
// string = enabled with specified buttons and groups
// string array = enabled with specified buttons and groups
// object array = enabled with specified buttons, groups and group titles
const createToolbar = (toolbarConfig: RenderToolbarConfig): ToolbarGroupOption[] => {
  const toolbar = toolbarConfig.toolbar;
  const buttons = toolbarConfig.buttons;
  if (toolbar === false) {
    return [];
  } else if (toolbar === undefined || toolbar === true) {
    return removeUnusedDefaults(buttons);
  } else if (typeof (toolbar) === 'string') {
    return convertStringToolbar(toolbar);
  } else if (isToolbarGroupSettingArray(toolbar)) {
    return toolbar;
  } else {
    // eslint-disable-next-line no-console
    console.error('Toolbar type should be string, string[], boolean or ToolbarGroup[]');
    return [];
  }
};

const lookupButton = (editor: Editor, buttons: Record<string, any>, toolbarItem: string, allowToolbarGroups: boolean, backstage: UiFactoryBackstage, prefixes: (string[]) | null): (AlloySpec) | null =>
  ((buttons)[toolbarItem.toLowerCase()] ?? null)
    .orThunk(() => prefixes.bind((ps) => ((ps) as any[]).reduce<any>((acc: any, x: any) => acc !== null ? acc : ((prefix) => ((buttons)[prefix + toolbarItem.toLowerCase()] ?? null))(x), null)))
    .fold(
      () => ((bespokeButtons)[toolbarItem.toLowerCase()] ?? null).map((r) => r(editor, backstage)),
      // TODO: Add back after TINY-3232 is implemented
      // .orThunk(() => {
      //   console.error('No representation for toolbarItem: ' + toolbarItem);
      //   return null;
      // ),
      (spec) => {
        if (spec.type === 'grouptoolbarbutton' && !allowToolbarGroups) {
          // TODO change this message when sliding is available
          // eslint-disable-next-line no-console
          console.warn(`Ignoring the '${toolbarItem}' toolbar button. Group toolbar buttons are only supported when using floating toolbar mode and cannot be nested.`);
          return null;
        } else {
          return extractFrom(spec, backstage, editor, toolbarItem.toLowerCase());
        }
      }
    );

const identifyButtons = (editor: Editor, toolbarConfig: RenderToolbarConfig, backstage: UiFactoryBackstage, prefixes: (string[]) | null): ToolbarGroup[] => {
  const toolbarGroups = createToolbar(toolbarConfig);
  const groups = (toolbarGroups).map((group) => {
    const items = (group.items).flatMap((toolbarItem) => {
      return toolbarItem.trim().length === 0 ? [] :
        lookupButton(editor, toolbarConfig.buttons, toolbarItem, toolbarConfig.allowToolbarGroups, backstage, prefixes).toArray();
    });
    return {
      title: (editor.translate(group.name) ?? null),
      items
    };
  });

  return (groups).filter((group) => group.items.length > 0);
};

export { identifyButtons };

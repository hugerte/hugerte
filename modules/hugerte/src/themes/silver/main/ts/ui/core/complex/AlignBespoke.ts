import { AlloyComponent, AlloyTriggers, SketchSpec } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';

import Editor from 'hugerte/core/api/Editor';
import { UiFactoryBackstage } from 'hugerte/themes/silver/backstage/Backstage';

import * as Events from '../../../api/Events';
import { updateMenuIcon } from '../../dropdown/CommonDropdown';
import { onSetupEditableToggle } from '../ControlUtils';
import { createMenuItems, createSelectButton, FormatterFormatItem, SelectedFormat, SelectSpec } from './BespokeSelect';
import { buildBasicStaticDataset } from './SelectDatasets';
import * as Tooltip from './utils/Tooltip';

const menuTitle = 'Align';
const btnTooltip = 'Alignment {0}';
const fallbackAlignment = 'left';

const alignMenuItems = [
  { title: 'Left', icon: 'align-left', format: 'alignleft', command: 'JustifyLeft' },
  { title: 'Center', icon: 'align-center', format: 'aligncenter', command: 'JustifyCenter' },
  { title: 'Right', icon: 'align-right', format: 'alignright', command: 'JustifyRight' },
  { title: 'Justify', icon: 'align-justify', format: 'alignjustify', command: 'JustifyFull' }
];

const getSpec = (editor: Editor): SelectSpec => {
  const getMatchingValue = (): (SelectedFormat) | null => ((alignMenuItems).find((item) => editor.formatter.match(item.format)) ?? null);

  const isSelectedFor = (format: string) => () => editor.formatter.match(format);

  const getPreviewFor = (_format: string) => Optional.none;

  const updateSelectMenuIcon = (comp: AlloyComponent) => {
    const match = getMatchingValue();
    const alignment = match.fold(() => fallbackAlignment, (item) => item.title.toLowerCase());
    AlloyTriggers.emitWith(comp, updateMenuIcon, {
      icon: `align-${alignment}`
    });
    Events.fireAlignTextUpdate(editor, { value: alignment });
  };

  const dataset = buildBasicStaticDataset(alignMenuItems);

  const onAction = (rawItem: FormatterFormatItem) => () =>
    ((alignMenuItems).find((item) => item.format === rawItem.format) ?? null)
      .each((item) => editor.execCommand(item.command));

  return {
    tooltip: Tooltip.makeTooltipText(editor, btnTooltip, fallbackAlignment),
    text: null,
    icon: 'align-left',
    isSelectedFor,
    getCurrentValue: Optional.none,
    getPreviewFor,
    onAction,
    updateText: updateSelectMenuIcon,
    dataset,
    shouldHide: false,
    isInvalid: (item) => !editor.formatter.canApply(item.format)
  };
};

const createAlignButton = (editor: Editor, backstage: UiFactoryBackstage): SketchSpec =>
  createSelectButton(editor, backstage, getSpec(editor), btnTooltip, 'AlignTextUpdate', 'align');

const createAlignMenu = (editor: Editor, backstage: UiFactoryBackstage): void => {
  const menuItems = createMenuItems(backstage, getSpec(editor));
  editor.ui.registry.addNestedMenuItem('align', {
    text: backstage.shared.providers.translate(menuTitle),
    onSetup: onSetupEditableToggle(editor),
    getSubmenuItems: () => menuItems.items.validateItems(menuItems.getStyleItems())
  });
};

export { createAlignButton, createAlignMenu };

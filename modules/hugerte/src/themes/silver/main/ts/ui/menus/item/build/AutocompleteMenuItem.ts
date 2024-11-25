import { Behaviour, GuiFactory, ItemTypes, MaxHeight, Tooltipping } from "@hugerte/alloy";
import { InlineContent, Toolbar } from "@hugerte/bridge";
import { Fun, Obj, Optional, Regex } from "@hugerte/katamari";
import { SugarElement } from "@hugerte/sugar";

import DOMUtils from 'hugerte/core/api/dom/DOMUtils';
import I18n from 'hugerte/core/api/util/I18n';
import { UiFactoryBackstageShared } from 'hugerte/themes/silver/backstage/Backstage';
import { buildData, renderCommonItem } from 'hugerte/themes/silver/ui/menus/item/build/CommonMenuItem';
import ItemResponse from 'hugerte/themes/silver/ui/menus/item/ItemResponse';
import { renderItemStructure } from 'hugerte/themes/silver/ui/menus/item/structure/ItemStructure';

type ItemValueHandler = (itemValue: string, itemMeta: Record<string, any>) => void;
type TooltipWorker = (success: (elem: HTMLElement) => void) => void;

// Use meta to pass through special information about the tooltip
// (yes this is horrible but it is not yet public API)
const tooltipBehaviour = (
  meta: Record<string, any>,
  sharedBackstage: UiFactoryBackstageShared,
  tooltipText: Optional<string>
): Behaviour.NamedConfiguredBehaviour<any, any, any>[] =>
  Obj.get(meta, 'tooltipWorker')
    .map((tooltipWorker: TooltipWorker) => [
      Tooltipping.config({
        lazySink: sharedBackstage.getSink,
        tooltipDom: {
          tag: 'div',
          classes: [ 'tox-tooltip-worker-container' ]
        },
        tooltipComponents: [
        ],
        anchor: (comp) => ({
          type: 'submenu',
          item: comp,
          overrides: {
            // NOTE: this avoids it setting overflow and max-height.
            maxHeightFunction: MaxHeight.expandable
          }
        }),
        mode: 'follow-highlight',
        onShow: (component, _tooltip) => {
          tooltipWorker((elm) => {
            Tooltipping.setComponents(component, [
              GuiFactory.external({ element: SugarElement.fromDom(elm) })
            ]);
          });
        }
      })
    ])
    .getOrThunk(() => {
      return tooltipText.map((text) =>
        [
          Tooltipping.config(
            {
              ...sharedBackstage.providers.tooltips.getConfig({
                tooltipText: text
              }),
              mode: 'follow-highlight'
            }
          )
        ]).getOr([]);
    });

const encodeText = (text: string) => DOMUtils.DOM.encode(text);
const replaceText = (text: string, matchText: string): string => {
  const translated = I18n.translate(text);
  const encoded = encodeText(translated);
  if (matchText.length > 0) {
    const escapedMatchRegex = new RegExp(Regex.escape(matchText), 'gi');
    return encoded.replace(escapedMatchRegex, (match) => `<span class="tox-autocompleter-highlight">${match}</span>`);
  } else {
    return encoded;
  }
};

const renderAutocompleteItem = (
  spec: InlineContent.AutocompleterItem,
  matchText: string,
  useText: boolean,
  presets: Toolbar.PresetItemTypes,
  onItemValueHandler: ItemValueHandler,
  itemResponse: ItemResponse,
  sharedBackstage: UiFactoryBackstageShared,
  renderIcons: boolean = true
): ItemTypes.ItemSpec => {
  const structure = renderItemStructure({
    presets,
    textContent: Optional.none(),
    htmlContent: useText ? spec.text.map((text) => replaceText(text, matchText)) : Optional.none(),
    ariaLabel: spec.text,
    iconContent: spec.icon,
    shortcutContent: Optional.none(),
    checkMark: Optional.none(),
    caret: Optional.none(),
    value: spec.value
  }, sharedBackstage.providers, renderIcons, spec.icon);

  const tooltipString = spec.text.filter((text) => !useText && text !== '');
  return renderCommonItem({
    data: buildData(spec),
    enabled: spec.enabled,
    getApi: Fun.constant({}),
    onAction: (_api) => onItemValueHandler(spec.value, spec.meta),
    onSetup: Fun.constant(Fun.noop),
    triggersSubmenu: false,
    itemBehaviours: tooltipBehaviour(spec, sharedBackstage, tooltipString)
  }, structure, itemResponse, sharedBackstage.providers);
};

export { renderAutocompleteItem, replaceText, tooltipBehaviour };

import { AlloyComponent, GuiFactory, HotspotAnchorSpec, TooltippingTypes } from '@ephox/alloy';
import { Cell, Future, Result } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';

import { UiFactoryBackstage } from 'hugerte/themes/silver/backstage/Backstage';
import { ApiUrlData } from 'hugerte/themes/silver/backstage/UrlInputBackstage';

import TestProviders from './TestProviders';

export default (sink?: AlloyComponent): UiFactoryBackstage => {
  // NOTE: Non-sensical anchor
  const hotspotAnchorFn = (): HotspotAnchorSpec => ({
    type: 'hotspot',
    hotspot: sink as AlloyComponent
  });
  const headerLocation = Cell<'top' | 'bottom'>('top');
  const contextMenuState = Cell(false);

  const getTooltipComponents = () => [
    {
      dom: {
        tag: 'div',
      },
      components: [
        GuiFactory.text('Test')
      ]
    }
  ];

  return {
    shared: {
      providers: {
        ...TestProviders,
        tooltips: {
          getConfig: (): TooltippingTypes.TooltippingConfigSpec => {
            return {
              lazySink: () => Result.value(sink),
              tooltipDom: { tag: 'div' },
              tooltipComponents: () => getTooltipComponents(),
            } as any;
          },
          getComponents: getTooltipComponents,
        }},
      interpreter: (x) => x as any,
      anchors: {
        inlineDialog: hotspotAnchorFn,
        inlineBottomDialog: hotspotAnchorFn,
        banner: hotspotAnchorFn,
        cursor: () => ({
          type: 'selection',
          root: SugarBody.body()
        }),
        node: (elem) => ({
          type: 'node',
          root: SugarBody.body(),
          node: elem
        })
      },
      header: {
        isPositionedAtTop: () => headerLocation.get() !== 'bottom',
        getDockingMode: headerLocation.get,
        setDockingMode: headerLocation.set
      },
      getSink: () => sink ? Result.value(sink) : Result.error('No test sink setup')
    },
    urlinput: {
      getHistory: () => [],
      addToHistory: () => {},
      getLinkInformation: () => null,
      getValidationHandler: () => null,
      getUrlPicker: (_filetype) => (entry: ApiUrlData) = Future.pure(entry))
    },
    styles: {
      getData: () => []
    },
    colorinput: {
      colorPicker: () => {},
      hasCustomColors: () => false,
      getColors: () => [],
      getColorCols: () => 5
    },
    dialog: {
      isDraggableModal: () => false
    },
    setContextMenuState: contextMenuState.set,
    isContextMenuOpen: contextMenuState.get
  };
};

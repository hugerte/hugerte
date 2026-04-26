import { AlloyComponent, Behaviour, Button as AlloyButton, GuiFactory, Memento, Replacing, SimpleOrSketchSpec } from '@ephox/alloy';
import { Attribute, Class } from '@ephox/sugar';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { renderReplaceableIconFromPack } from '../button/ButtonSlices';
import { calculateClassesFromButtonType, IconButtonWrapper, renderCommonSpec } from '../general/Button';
import { componentRenderPipeline } from '../menus/item/build/CommonMenuItem';
import { ViewButtonClasses } from '../toolbar/button/ButtonClasses';
import { ViewButtonWithoutGroup } from './View';

type Behaviours = Behaviour.NamedConfiguredBehaviour<any, any, any>[];

export const renderButton = (spec: ViewButtonWithoutGroup, providers: UiFactoryBackstageProviders): SimpleOrSketchSpec => {
  const isToggleButton = spec.type === 'togglebutton';

  const optMemIcon = spec.icon
    .map((memIcon) => renderReplaceableIconFromPack(memIcon, providers.icons))
    .map(Memento.record);

  const getAction = () => (comp: AlloyComponent) => {
    const setIcon = (newIcon: string) => {
      optMemIcon.map((memIcon) => memIcon.getOpt(comp).each((displayIcon) => {
        Replacing.set(displayIcon, [
          renderReplaceableIconFromPack(newIcon, providers.icons)
        ]);
      }));
    };
    const setActive = (state: boolean) => {
      const elm = comp.element;
      if (state) {
        Class.add(elm, ViewButtonClasses.Ticked);
        Attribute.set(elm, 'aria-pressed', true);
      } else {
        Class.remove(elm, ViewButtonClasses.Ticked);
        Attribute.remove(elm, 'aria-pressed');
      }
    };
    const isActive = () => Class.has(comp.element, ViewButtonClasses.Ticked);

    if (isToggleButton) {
      return spec.onAction({ setIcon, setActive, isActive });
    }
    if (spec.type === 'button') {
      return spec.onAction({ setIcon });
    }
  };

  const action = getAction();

  const buttonSpec: IconButtonWrapper = {
    ...spec,
    name: isToggleButton ? spec.text ?? (spec.icon ?? ('')) : spec.text ?? spec.icon ?? (''),
    primary: spec.buttonType === 'primary',
    buttonType: (spec.buttonType ?? null),
    tooltip: spec.tooltip,
    icon: spec.icon,
    enabled: true,
    borderless: spec.borderless
  };

  const buttonTypeClasses = calculateClassesFromButtonType(spec.buttonType ?? 'secondary');
  const optTranslatedText = isToggleButton ? spec.text.map(providers.translate) : providers.translate(spec.text);
  const optTranslatedTextComponed = optTranslatedText.map(GuiFactory.text);

  const ariaLabelAttributes = buttonSpec.tooltip.or(optTranslatedText).map<{}>((al) => ({
    'aria-label': providers.translate(al),
  })) ?? ({});

  const optIconSpec = optMemIcon.map((memIcon) => memIcon.asSpec());
  const components = componentRenderPipeline([ optIconSpec, optTranslatedTextComponed ]);

  const hasIconAndText = spec.icon !== null && optTranslatedTextComponed !== null;

  const dom = {
    tag: 'button',
    classes: buttonTypeClasses
      .concat(...spec.icon !== null && !hasIconAndText ? [ 'tox-button--icon' ] : [])
      .concat(...hasIconAndText ? [ 'tox-button--icon-and-text' ] : [])
      .concat(...spec.borderless ? [ 'tox-button--naked' ] : [])
      .concat(...spec.type === 'togglebutton' && spec.active ? [ ViewButtonClasses.Ticked ] : []),
    attributes: ariaLabelAttributes
  };
  const extraBehaviours: Behaviours = [];

  const iconButtonSpec = renderCommonSpec(buttonSpec, action, extraBehaviours, dom, components, spec.tooltip, providers);
  return AlloyButton.sketch(iconButtonSpec);
};

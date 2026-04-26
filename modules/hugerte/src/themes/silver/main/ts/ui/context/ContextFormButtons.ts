import {
  AlloyComponent, AlloyEvents, AlloyTriggers, Disabling, Memento, MementoRecord, Representing, SimpleOrSketchSpec, SystemEvents
} from '@ephox/alloy';
import { StructureSchema } from '@ephox/boulder';
import { InlineContent, Toolbar } from '@ephox/bridge';
import { Arr } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { internalToolbarButtonExecute, InternalToolbarButtonExecuteEvent } from '../toolbar/button/ButtonEvents';
import { renderToolbarButtonWith, renderToolbarToggleButtonWith } from '../toolbar/button/ToolbarButtons';

type ContextFormButton = InlineContent.ContextFormToggleButton | InlineContent.ContextFormButton;

interface ContextFormButtonRegistry {
  readonly asSpecs: () => SimpleOrSketchSpec[];
  readonly findPrimary: (compInSystem: AlloyComponent) => (AlloyComponent) | null;
}

// Can probably generalise.

const getFormApi = (input: AlloyComponent): InlineContent.ContextFormInstanceApi => ({
  hide: () => AlloyTriggers.emit(input, SystemEvents.sandboxClose()),
  getValue: () => Representing.getValue(input)
});

const runOnExecute = <T>(memInput: MementoRecord, original: { onAction: (formApi: InlineContent.ContextFormInstanceApi, buttonApi: T) => void }) =>
  AlloyEvents.run<InternalToolbarButtonExecuteEvent<T>>(internalToolbarButtonExecute, (comp, se) => {
    const input = memInput.get(comp);
    const formApi = getFormApi(input);
    original.onAction(formApi, se.event.buttonApi);
  });

const renderContextButton = (memInput: MementoRecord, button: InlineContent.ContextFormButton, providers: UiFactoryBackstageProviders) => {
  const { primary, ...rest } = button.original;
  const bridged = StructureSchema.getOrDie(
    Toolbar.createToolbarButton({
      ...rest,
      type: 'button',
      onAction: () => {}
    })
  );

  return renderToolbarButtonWith(bridged, providers, [
    runOnExecute<Toolbar.ToolbarButtonInstanceApi>(memInput, button)
  ]);
};

const renderContextToggleButton = (memInput: MementoRecord, button: InlineContent.ContextFormToggleButton, providers: UiFactoryBackstageProviders) => {
  const { primary, ...rest } = button.original;
  const bridged = StructureSchema.getOrDie(
    Toolbar.createToggleButton({
      ...rest,
      type: 'togglebutton',
      onAction: () => {}
    })
  );

  return renderToolbarToggleButtonWith(bridged, providers, [
    runOnExecute<InlineContent.ContextFormToggleButtonInstanceApi>(memInput, button)
  ]);
};

const isToggleButton = (button: ContextFormButton): button is InlineContent.ContextFormToggleButton =>
  button.type === 'contextformtogglebutton';

const generateOne = (memInput: MementoRecord, button: ContextFormButton, providersBackstage: UiFactoryBackstageProviders) => {
  if (isToggleButton(button)) {
    return renderContextToggleButton(memInput, button, providersBackstage);
  } else {
    return renderContextButton(memInput, button, providersBackstage);
  }
};

const generate = (memInput: MementoRecord, buttons: ContextFormButton[], providersBackstage: UiFactoryBackstageProviders): ContextFormButtonRegistry => {

  const mementos = (buttons).map((button) => Memento.record(
    generateOne(memInput, button, providersBackstage)
  ));

  const asSpecs = () => (mementos).map((mem) => mem.asSpec());

  const findPrimary = (compInSystem: AlloyComponent): (AlloyComponent) | null => Arr.findMap(buttons, (button, i) => {
    if (button.primary) {
      return (mementos[i] ?? null).bind((mem) => mem.getOpt(compInSystem)).filter((x: any) => !(Disabling.isDisabled)(x));
    } else {
      return null;
    }
  });

  return {
    asSpecs,
    findPrimary
  };
};

export {
  generate
};

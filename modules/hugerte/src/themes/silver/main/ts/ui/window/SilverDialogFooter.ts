import {
  AlloyComponent, AlloyParts, Behaviour, Container, DomFactory, Memento, MementoRecord, ModalDialog, Reflecting, SimpleSpec, SketchSpec
} from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';


import { UiFactoryBackstage } from '../../backstage/Backstage';
import { renderFooterButton } from '../general/Button';
import { footerChannel } from './DialogChannels';

export interface DialogMemButton {
  readonly name: Dialog.DialogFooterButton['name'];
  readonly align: Dialog.DialogFooterButton['align'];
  readonly memento: MementoRecord;
}

export interface WindowFooterSpec {
  readonly buttons: Dialog.DialogFooterButton[];
}

export interface FooterState {
  readonly lookupByName: (buttonName: string) => (AlloyComponent) | null;
  readonly footerButtons: DialogMemButton[];
}

const makeButton = (button: Dialog.DialogFooterButton, backstage: UiFactoryBackstage) =>
  renderFooterButton(button, button.type, backstage);

const lookup = (compInSystem: AlloyComponent, footerButtons: DialogMemButton[], buttonName: string) =>
  ((footerButtons).find((button) => button.name === buttonName) ?? null)
    .bind((memButton) => memButton.memento.getOpt(compInSystem));

const renderComponents = (_data: WindowFooterSpec, state: (FooterState) | null): SketchSpec[] => {
  // default group is 'end'
  const footerButtons = state.map((s) => s.footerButtons) ?? ([ ]);
  const buttonGroups = (footerButtons).reduce((acc: { pass: any[], fail: any[] }, x: any, i: number) => { (((button) => button.align === 'start')(x, i) ? acc.pass : acc.fail).push(x); return acc; }, { pass: [], fail: [] });

  const makeGroup = (edge: string, buttons: DialogMemButton[]): SketchSpec => Container.sketch({
    dom: {
      tag: 'div',
      classes: [ `tox-dialog__footer-${edge}` ]
    },
    components: (buttons).map((button) => button.memento.asSpec())
  });

  const startButtons = makeGroup('start', buttonGroups.pass);
  const endButtons = makeGroup('end', buttonGroups.fail);
  return [ startButtons, endButtons ];
};

const renderFooter = (initSpec: WindowFooterSpec, dialogId: string, backstage: UiFactoryBackstage): SimpleSpec => {
  const updateState = (comp: AlloyComponent, data: WindowFooterSpec) => {
    const footerButtons: DialogMemButton[] = (data.buttons).map((button) => {
      const memButton = Memento.record(makeButton(button, backstage));
      return {
        name: button.name,
        align: button.align,
        memento: memButton
      };
    });

    const lookupByName = (buttonName: string) =>
      lookup(comp, footerButtons, buttonName);

    return {
      lookupByName,
      footerButtons
    };
  };

  return {
    dom: DomFactory.fromHtml('<div class="tox-dialog__footer"></div>'),
    components: [],
    behaviours: Behaviour.derive([
      Reflecting.config({
        channel: `${footerChannel}-${dialogId}`,
        initialData: initSpec,
        updateState,
        renderComponents
      })
    ])
  };
};

const renderInlineFooter = (initSpec: WindowFooterSpec, dialogId: string, backstage: UiFactoryBackstage): SimpleSpec =>
  renderFooter(initSpec, dialogId, backstage);

const renderModalFooter = (initSpec: WindowFooterSpec, dialogId: string, backstage: UiFactoryBackstage): AlloyParts.ConfiguredPart =>
  ModalDialog.parts.footer(renderFooter(initSpec, dialogId, backstage));

export {
  renderInlineFooter,
  renderModalFooter
};

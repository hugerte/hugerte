import { Keys } from '@ephox/agar';
import { AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloySpec, Behaviour, Button, Disabling, Focusing, FocusInsideModes, Input, Keying, Memento, NativeEvents, Representing, SystemEvents, Tooltipping } from '@ephox/alloy';
import { Cell } from '@ephox/katamari';
import { Focus, SugarElement, Traverse } from '@ephox/sugar';

import Editor from 'hugerte/core/api/Editor';
import { UiFactoryBackstage } from 'hugerte/themes/silver/backstage/Backstage';

import { renderIconFromPack } from '../../button/ButtonSlices';
import { onControlAttached, onControlDetached } from '../../controls/Controls';
import { updateMenuText, UpdateMenuTextEvent } from '../../dropdown/CommonDropdown';
import { onSetupEvent } from '../ControlUtils';
import { NumberInputSpec } from './FontSizeBespoke';

interface BespokeSelectApi {
  readonly getComponent: () => AlloyComponent;
}

const createBespokeNumberInput = (editor: Editor, backstage: UiFactoryBackstage, spec: NumberInputSpec, btnName?: string): AlloySpec => {
  let currentComp: (AlloyComponent) | null = null;

  const getValueFromCurrentComp = (comp: (AlloyComponent) | null): string =>
    comp.map((alloyComp) => Representing.getValue(alloyComp)) ?? ('');

  const onSetup = onSetupEvent(editor, 'NodeChange SwitchMode', (api: BespokeSelectApi) => {
    const comp = api.getComponent();
    currentComp = comp;
    spec.updateInputValue(comp);
    Disabling.set(comp, !editor.selection.isEditable());
  });

  const getApi = (comp: AlloyComponent): BespokeSelectApi => ({ getComponent: () => comp });
  const editorOffCell = Cell(() => {});

  const customEvents = (('custom-number-input-events') + '_' + Math.floor(Math.random() * 1e9) + Date.now());

  const changeValue = (f: (v: number, step: number) => number, fromInput: boolean, focusBack: boolean): void => {
    const text = getValueFromCurrentComp(currentComp);

    const newValue = spec.getNewValue(text, f);

    const lenghtDelta = text.length - `${newValue}`.length;
    const oldStart = currentComp.map((comp) => comp.element.dom.selectionStart - lenghtDelta);
    const oldEnd = currentComp.map((comp) => comp.element.dom.selectionEnd - lenghtDelta);

    spec.onAction(newValue, focusBack);
    currentComp.each((comp) => {
      Representing.setValue(comp, newValue);
      if (fromInput) {
        oldStart.each((oldStart) => comp.element.dom.selectionStart = oldStart);
        oldEnd.each((oldEnd) => comp.element.dom.selectionEnd = oldEnd);
      }
    });
  };

  const decrease = (fromInput: boolean, focusBack: boolean) => changeValue((n, s) => n - s, fromInput, focusBack);
  const increase = (fromInput: boolean, focusBack: boolean) => changeValue((n, s) => n + s, fromInput, focusBack);

  const goToParent = (comp: AlloyComponent) =>
    Traverse.parentElement(comp.element).fold(() => null, (parent) => {
      Focus.focus(parent);
      return true;
    });

  const focusInput = (comp: AlloyComponent) => {
    if (Focus.hasFocus(comp.element)) {
      Traverse.firstChild(comp.element).each((input) => Focus.focus(input as SugarElement<HTMLElement>));
      return true;
    } else {
      return null;
    }
  };

  const makeStepperButton = (action: (focusBack: boolean) => void, title: string, tooltip: string, classes: string[]) => {
    const editorOffCellStepButton = Cell(() => {});
    const translatedTooltip = backstage.shared.providers.translate(tooltip);
    const altExecuting = (('altExecuting') + '_' + Math.floor(Math.random() * 1e9) + Date.now());
    const onSetup = onSetupEvent(editor, 'NodeChange SwitchMode', (api: BespokeSelectApi) => {
      Disabling.set(api.getComponent(), !editor.selection.isEditable());
    });

    const onClick = (comp: AlloyComponent) => {
      if (!Disabling.isDisabled(comp)) {
        action(true);
      }
    };

    return Button.sketch({
      dom: {
        tag: 'button',
        attributes: {
          'aria-label': translatedTooltip,
          'data-mce-name': title
        },
        classes: classes.concat(title)
      },
      components: [
        renderIconFromPack(title, backstage.shared.providers.icons)
      ],
      buttonBehaviours: Behaviour.derive([
        Disabling.config({}),
        Tooltipping.config(
          backstage.shared.providers.tooltips.getConfig({
            tooltipText: translatedTooltip
          })
        ),
        AddEventsBehaviour.config(altExecuting, [
          onControlAttached({ onSetup, getApi }, editorOffCellStepButton),
          onControlDetached({ getApi }, editorOffCellStepButton),
          AlloyEvents.run(NativeEvents.keydown(), (comp, se) => {
            if (se.event.raw.keyCode === Keys.space() || se.event.raw.keyCode === Keys.enter()) {
              if (!Disabling.isDisabled(comp)) {
                action(false);
              }
            }
          }),
          AlloyEvents.run(NativeEvents.click(), onClick),
          AlloyEvents.run(NativeEvents.touchend(), onClick)
        ])
      ]),
      eventOrder: {
        [NativeEvents.keydown()]: [ altExecuting, 'keying' ],
        [NativeEvents.click()]: [ altExecuting, 'alloy.base.behaviour' ],
        [NativeEvents.touchend()]: [ altExecuting, 'alloy.base.behaviour' ],
        [SystemEvents.attachedToDom()]: [ 'alloy.base.behaviour', altExecuting, 'tooltipping' ],
        [SystemEvents.detachedFromDom()]: [ altExecuting, 'tooltipping' ]
      }
    });
  };

  const memMinus = Memento.record(makeStepperButton((focusBack) => decrease(false, focusBack), 'minus', 'Decrease font size', []));
  const memPlus = Memento.record(makeStepperButton((focusBack) => increase(false, focusBack), 'plus', 'Increase font size', []));

  const memInput = Memento.record({
    dom: {
      tag: 'div',
      classes: [ 'tox-input-wrapper' ]
    },
    components: [
      Input.sketch({
        inputBehaviours: Behaviour.derive([
          Disabling.config({}),
          AddEventsBehaviour.config(customEvents, [
            onControlAttached({ onSetup, getApi }, editorOffCell),
            onControlDetached({ getApi }, editorOffCell)
          ]),
          AddEventsBehaviour.config('input-update-display-text', [
            AlloyEvents.run<UpdateMenuTextEvent>(updateMenuText, (comp, se) => {
              Representing.setValue(comp, se.event.text);
            }),
            AlloyEvents.run(NativeEvents.focusout(), (comp) => {
              spec.onAction(Representing.getValue(comp));
            }),
            AlloyEvents.run(NativeEvents.change(), (comp) => {
              spec.onAction(Representing.getValue(comp));
            })
          ]),
          Keying.config({
            mode: 'special',
            onEnter: (_comp) => {
              changeValue((x: any) => x, true, true);
              return true;
            },
            onEscape: goToParent,
            onUp: (_comp) => {
              increase(true, false);
              return true;
            },
            onDown: (_comp) => {
              decrease(true, false);
              return true;
            },
            onLeft: (_comp, se) => {
              se.cut();
              return null;
            },
            onRight: (_comp, se) => {
              se.cut();
              return null;
            }
          })
        ])
      })
    ],
    behaviours: Behaviour.derive([
      Focusing.config({}),
      Keying.config({
        mode: 'special',
        onEnter: focusInput,
        onSpace: focusInput,
        onEscape: goToParent
      }),
      AddEventsBehaviour.config('input-wrapper-events', [
        AlloyEvents.run(NativeEvents.mouseover(), (comp) => {
          ([ memMinus, memPlus ]).forEach((button) => {
            const buttonNode = SugarElement.fromDom(button.get(comp).element.dom);
            if (Focus.hasFocus(buttonNode)) {
              Focus.blur(buttonNode);
            }
          });
        })
      ])
    ])
  });

  return {
    dom: {
      tag: 'div',
      classes: [ 'tox-number-input' ],
      attributes: {
        ...((btnName) != null ? { 'data-mce-name': btnName } : {})
      }
    },
    components: [
      memMinus.asSpec(),
      memInput.asSpec(),
      memPlus.asSpec()
    ],
    behaviours: Behaviour.derive([
      Focusing.config({}),
      Keying.config({
        mode: 'flow',
        focusInside: FocusInsideModes.OnEnterOrSpaceMode,
        cycles: false,
        selector: 'button, .tox-input-wrapper',
        onEscape: (wrapperComp) => {
          if (Focus.hasFocus(wrapperComp.element)) {
            return null;
          } else {
            Focus.focus(wrapperComp.element);
            return true;
          }
        },
      })
    ])
  };
};

export { createBespokeNumberInput };

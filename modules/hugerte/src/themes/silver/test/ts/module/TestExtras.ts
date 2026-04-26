import { Attachment, Behaviour, DomFactory, Gui, GuiFactory, Positioning } from '@ephox/alloy';
import { after, afterEach, before } from '@ephox/bedrock-client';

import { Class, SugarBody, SugarElement } from '@ephox/sugar';

import Editor from 'hugerte/core/api/Editor';
import { UiFactoryBackstagePair } from 'hugerte/themes/silver/backstage/Backstage';

import TestBackstage from './TestBackstage';

export interface TestExtras {
  readonly extras: {
    readonly editor: Editor;
    readonly backstages: UiFactoryBackstagePair;
  };
  readonly destroy: () => void;
  readonly mockEditor: Editor;
  readonly getPopupSink: () => SugarElement<HTMLElement>;
  readonly getPopupMothership: () => Gui.GuiSystem;
  readonly getDialogSink: () => SugarElement<HTMLElement>;
}

interface BddTestExtrasHook {
  readonly access: () => TestExtras;
}

export const TestExtras = (): TestExtras => {

  const oldSink = document.querySelectorAll('.mce-silver-sink');
  if (oldSink.length > 0) {
    throw Error('old sinks found, a previous test did not call helpers.destroy() leaving artifacts, found: ' + oldSink.length);
  }

  const dialogSink = GuiFactory.build({
    dom: DomFactory.fromHtml('<div class="mce-silver-sink test-dialogs-sink"></div>'),
    behaviours: Behaviour.derive([
      Positioning.config({
        useFixed: () => true
      })
    ])
  });

  const popupSink = GuiFactory.build({
    dom: DomFactory.fromHtml('<div class="mce-silver-sink test-popups-sink"></div>'),
    behaviours: Behaviour.derive([
      Positioning.config({
        useFixed: () => true
      })
    ])
  });

  const dialogMothership = Gui.create();
  Class.add(dialogMothership.element, 'tox');
  Class.add(dialogMothership.element, 'test-dialogs-mothership');

  const popupMothership = Gui.create();
  Class.add(popupMothership.element, 'tox');
  Class.add(popupMothership.element, 'test-popups-mothership');

  const backstages = {
    popup: TestBackstage(popupSink),
    dialog: TestBackstage(dialogSink)
  };
  const options: Record<string, any> = {};

  const editorOn: Editor['on'] = (_name, _callback) => {
    return { } as any;
  };

  const editorOff: Editor['off'] = (_name, _callback) => {
    return { } as any;
  };

  const mockEditor = {
    setContent: (_content) => {},
    on: editorOn,
    off: editorOff,
    insertContent: (_content: string, _args?: any) => {},
    execCommand: (_cmd: string, _ui?: boolean, _value?: any) => {},
    getContainer: () => SugarBody.body().dom,
    getContentAreaContainer: () => SugarBody.body().dom,
    ui: {
      show: () => {}
    },
    options: {
      get: (name: string) => options[name]
    }
  } as Editor;

  const extras = {
    editor: mockEditor,
    backstages
  };

  dialogMothership.add(dialogSink);
  popupMothership.add(popupSink);
  Attachment.attachSystem(SugarBody.body(), dialogMothership);
  Attachment.attachSystem(SugarBody.body(), popupMothership);

  const getPopupSink = () => popupSink.element;
  const getDialogSink = () => dialogSink.element;
  const getPopupMothership = () => popupMothership;

  const destroy = () => {
    dialogMothership.remove(dialogSink);
    dialogMothership.destroy();
    popupMothership.remove(popupSink);
    popupMothership.destroy();
  };

  return {
    extras,
    destroy,
    mockEditor,
    getPopupSink,
    getDialogSink,
    getPopupMothership
  };
};

export const bddSetup = (): BddTestExtrasHook => {
  let helpers: TestExtras | null = null;
  let hasFailure = false;

  before(() => {
    helpers = TestExtras();
  });

  afterEach(function () {
    if (this.currentTest?.isFailed() === true) {
      hasFailure = true;
    }
  });

  after(() => {
    if (!hasFailure) {
      helpers.each((h) => h.destroy());
      helpers = null;
    }
  });

  const access = (): TestExtras => helpers.getOrDie(
    'The setup hooks have not run yet'
  );

  return {
    access
  };
};

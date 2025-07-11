import { TestLogs } from '@ephox/agar';
import { Arr, Fun, PromiseResult, Global, Id, Optional, Result } from '@ephox/katamari';
import { Attribute, DomEvent, Insert, Remove, SelectorFilter, SugarBody, SugarElement, SugarShadowDom } from '@ephox/sugar';

import { Editor } from '../alien/EditorTypes';
import { detectHugerteBaseUrl } from './Urls';

export type SuccessCallback = (v?: any, logs?: TestLogs) => void;
export type FailureCallback = (err: Error | string, logs?: TestLogs) => void;
export type RunCallback = (editor: any, success: SuccessCallback, failure: FailureCallback) => void;

interface Callbacks {
  preInit: (hugerte: any, settings: Record<string, any>) => void;
  run: RunCallback;
  success: SuccessCallback;
  failure: FailureCallback;
}

const createTarget = (inline: boolean) => SugarElement.fromTag(inline ? 'div' : 'textarea');

const removeHugerteElements = () => {
  // NOTE: Don't remove the link/scripts added, as those are part of the global hugerte which we don't clean up
  const elements = Arr.flatten([
    // Some older versions of hugerte leaves elements behind in the dom
    SelectorFilter.all('.mce-notification,.mce-window,#mce-modal-block'),
    // HugeRTE leaves inline editor content_styles in the dom
    SelectorFilter.children(SugarElement.fromDom(document.head), 'style')
  ]);

  Arr.each(elements, Remove.remove);
};

const loadScript = (url: string): PromiseResult<string, Error> => PromiseResult.nu((resolve) => {
  const script = SugarElement.fromTag('script');

  Attribute.set(script, 'referrerpolicy', 'origin');

  Attribute.set(script, 'src', url);
  const onLoad = DomEvent.bind(script, 'load', () => {
    onLoad.unbind();
    onError.unbind();
    resolve(Result.value(url));
  });
  const onError = DomEvent.bind(script, 'error', () => {
    onLoad.unbind();
    onError.unbind();
    resolve(Result.error(new Error('Failed to load script: ' + url)));
  });
  Insert.append(SugarBody.body(), script);
});

const setup = (callbacks: Callbacks, settings: Record<string, any>, elementOpt: Optional<SugarElement<Element>>): void => {
  const target = elementOpt.getOrThunk(() => createTarget(settings.inline));
  const randomId = Id.generate('tiny-loader');
  Attribute.set(target, 'id', randomId);

  if (!SugarBody.inBody(target)) {
    Insert.append(SugarBody.body(), target);
  }

  const teardown = () => {
    Global.hugerte.remove();
    Remove.remove(target);
    removeHugerteElements();
  };

  // Agar v. ??? supports logging
  const onSuccess = (v?: any, logs?: TestLogs) => {
    teardown();
    // We may want to continue the logs for multiple editor
    // loads in the same test
    callbacks.success(v, logs);
  };

  // Agar v. ??? supports logging
  const onFailure = (err: Error | string, logs?: TestLogs) => {
    // eslint-disable-next-line no-console
    console.log('Tiny Loader error: ', err);
    // Do no teardown so that the failed test still shows the editor. Important for selection
    callbacks.failure(err, logs);
  };

  const settingsSetup = settings.setup !== undefined ? settings.setup : Fun.noop;

  const run = () => {
    const hugerte = Global.hugerte;
    callbacks.preInit(hugerte, settings);

    const targetSettings = SugarShadowDom.isInShadowRoot(target) ? ({ target: target.dom }) : ({ selector: '#' + randomId });

    hugerte.init({
      ...settings,
      ...targetSettings,
      setup: (editor: Editor) => {
        // Execute the setup called by the test.
        settingsSetup(editor);

        editor.once('SkinLoaded', () => {
          setTimeout(() => {
            try {
              callbacks.run(editor, onSuccess, onFailure);
            } catch (e: any) {
              onFailure(e);
            }
          }, 0);
        });

        editor.once('SkinLoadError', (e) => {
          callbacks.failure(e.message);
        });
      }
    });
  };

  if (!Global.hugerte) {
    // Attempt to load HugeRTE if it's not available
    loadScript(detectHugerteBaseUrl(settings) + '/hugerte.js').then((result) => {
      result.fold(() => callbacks.failure('Failed to find a global hugerte instance'), run);
    });
  } else {
    run();
  }
};

export {
  setup,
  loadScript
};

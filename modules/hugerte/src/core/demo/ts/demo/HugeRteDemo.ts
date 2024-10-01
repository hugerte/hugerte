import { Class, Insert, SelectorFind, SugarBody, SugarElement, Value } from '@ephox/sugar';

import { HugeRTE } from 'hugerte/core/api/PublicApi';

declare let hugerte: HugeRTE;

export default (): void => {
  const textarea = SugarElement.fromTag('textarea');
  Value.set(textarea, '<p>Bolt</p>');
  Class.add(textarea, 'hugerte');
  const container = SelectorFind.descendant(SugarBody.body(), '#ephox-ui').getOrDie();
  Insert.append(container, textarea);

  hugerte.init({
    // imagetools_cors_hosts: ["moxiecode.cachefly.net"],
    // imagetools_proxy: "proxy.php",
    // imagetools_api_key: '123',

    // images_upload_url: 'postAcceptor.php',
    // images_upload_base_path: 'base/path',
    // images_upload_credentials: true,
    skin_url: '../../../../js/hugerte/skins/ui/oxide',
    setup: (ed) => {
      ed.ui.registry.addButton('demoButton', {
        text: 'Demo',
        onAction: () => {
          ed.insertContent('Hello world!');
        }
      });
    },

    selector: 'textarea.hugerte',
    toolbar1: 'demoButton bold italic',
    menubar: false
  });
};

import { Insert, SelectorFind, SugarBody, SugarElement, Value } from '@ephox/sugar';

import { HugeRTE } from 'hugerte/core/api/PublicApi';

declare let hugerte: HugeRTE;

export default (init: ShadowRootInit): void => {

  const shadowHost = SelectorFind.descendant<HTMLElement>(SugarBody.body(), '#shadow-host').getOrDie();
  shadowHost.dom.tabIndex = 1;

  const shadow = SugarElement.fromDom(shadowHost.dom.attachShadow(init));

  const node = SugarElement.fromTag('textarea');
  Value.set(node, 'here is some content');
  Insert.append(shadow, node);

  hugerte.init({
    target: node.dom,
    plugins: 'advlist charmap code codesample emoticons fullscreen image link lists media preview searchreplace table wordcount'
  });
};

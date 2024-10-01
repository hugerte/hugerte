import { Insert, SelectorFind, SugarBody, SugarElement, TextContent } from '@ephox/sugar';

import { HugeRTE } from 'hugerte/core/api/PublicApi';

declare let hugerte: HugeRTE;

export default (init: ShadowRootInit): void => {

  const shadowHost = SelectorFind.descendant<HTMLElement>(SugarBody.body(), '#shadow-host').getOrDie();

  const shadow = SugarElement.fromDom(shadowHost.dom.attachShadow(init));

  let i = 0;
  const addSection = (): void => {
    const node = SugarElement.fromTag('div');
    TextContent.set(node, 'content section ' + i++);
    Insert.append(shadow, node);
    hugerte.init({
      target: node.dom,
      inline: true
    });
  };

  addSection();
  addSection();
  addSection();
};

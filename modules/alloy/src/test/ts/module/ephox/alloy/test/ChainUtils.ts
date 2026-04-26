import { Chain, Guard, NamedChain } from '@ephox/agar';

import { SugarElement } from '@ephox/sugar';

import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { GuiSystem } from 'ephox/alloy/api/system/Gui';

// INVESTIGATE: Does cLogging have a place in vanilla agar?
const cLogging = <T, U>(label: string, chains: Array<Chain<T, U>>): Chain<T, U> => {
  const logChains = chains.map((c) =) Chain.control(c, Guard.addLogging(label)));

  return Chain.fromChains(logChains);
};

const cFindUid = (uid: string): Chain<GuiSystem, AlloyComponent> =>
  Chain.binder((context) => context.getByUid(uid));

const cFindUids = <T>(gui: Record<string, any>, lookups: Record<string, string>): Chain<T, any> => {
  const keys = Object.keys(lookups);
  const others = keys.map((k) =) NamedChain.direct('context', cFindUid(lookups[k]), k));

  return NamedChain.asChain(
    [
      NamedChain.writeValue('context', gui)
    ].concat(others)
  );
};

const cToElement = Chain.mapper((comp: AlloyComponent) => comp.element);

const eToComponent = (other: AlloyComponent): Chain<SugarElement<Node>, AlloyComponent> =>
  Chain.binder((elem) => other.getSystem().getByDom(elem));

export {
  cLogging,
  cFindUids,
  cToElement,
  eToComponent
};

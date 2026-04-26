import { EventArgs } from '@ephox/sugar';

import { KeyRuleHandler } from '../keying/KeyingModeTypes';
import * as KeyMatch from './KeyMatch';

export interface KeyRule<C, S> {
  matches: KeyMatch.KeyMatcher;
  classification: KeyRuleHandler<C, S>;
}

const basic = <C, S>(key: number, action: KeyRuleHandler<C, S>): KeyRule<C, S> => ({
  matches: KeyMatch.is(key),
  classification: action
});

const rule = <C, S>(matches: KeyMatch.KeyMatcher, action: KeyRuleHandler<C, S>): KeyRule<C, S> => ({
  matches,
  classification: action
});

const choose = <C, S>(transitions: Array<KeyRule<C, S>>, event: EventArgs<KeyboardEvent>): (KeyRuleHandler<C, S>) | null => {
  const transition = ((transitions).find((t) => t.matches(event)) ?? null);

  return transition.map((t) => t.classification);
};

export {
  basic,
  rule,
  choose
};

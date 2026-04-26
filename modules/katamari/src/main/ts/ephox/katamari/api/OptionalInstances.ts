import { Eq, Pnode, Pprint, Testable } from '@ephox/dispute';

import { Optional } from './Optional';
import * as Optionals from './Optionals';

type Pprint<A> = Pprint.Pprint<A>;
type Eq<A> = Eq.Eq<A>;
type Testable<A> = Testable.Testable<A>;

export const pprintOptional = <A> (pprintA: Pprint<A> = Pprint.pprintAny): Pprint<A | null> => Pprint.pprint((oa: A | null) =>
  oa.fold(
    () => Pnode.single('null'),
    (a) => Pnode.pnode('', [ pprintA.pprint(a) ], '')
  )
);

export const eqOptional = <A> (eqA: Eq<A> = Eq.eqAny): Eq<A | null> =>
  Eq.eq((oa, ob) => Optionals.equals(oa, ob, eqA.eq));

export const tOptional = <A> (testableA: Testable<A> = Testable.tAny): Testable<A | null> =>
  Testable.testable(eqOptional(testableA), pprintOptional(testableA));

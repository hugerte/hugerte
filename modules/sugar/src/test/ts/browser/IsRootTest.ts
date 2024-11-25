import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Fun, Optional } from "@hugerte/katamari";

import * as Compare from "hugerte/sugar/api/dom/Compare";
import * as Remove from "hugerte/sugar/api/dom/Remove";
import { SugarElement } from "hugerte/sugar/api/node/SugarElement";
import * as PredicateExists from "hugerte/sugar/api/search/PredicateExists";
import * as PredicateFilter from "hugerte/sugar/api/search/PredicateFilter";
import * as PredicateFind from "hugerte/sugar/api/search/PredicateFind";
import * as SelectorExists from "hugerte/sugar/api/search/SelectorExists";
import * as SelectorFilter from "hugerte/sugar/api/search/SelectorFilter";
import * as SelectorFind from "hugerte/sugar/api/search/SelectorFind";
import * as Traverse from "hugerte/sugar/api/search/Traverse";
import * as Checkers from "hugerte/sugar/test/Checkers";
import * as TestPage from "hugerte/sugar/test/TestPage";

UnitTest.test('IsRootTest', () => {
  TestPage.connect(); // description of structure is in TestPage

  const isRoot = (e: SugarElement<unknown>) => Compare.eq(TestPage.d1, e);

  const checkNone = <T extends Node>(optElement: Optional<SugarElement<T>>) => Checkers.checkOpt(Optional.none<SugarElement<T>>(), optElement);

  checkNone(SelectorFind.ancestor(TestPage.t6, 'li', isRoot));
  checkNone(SelectorFind.ancestor(TestPage.t6, 'ol,ul', isRoot));
  checkNone(PredicateFind.ancestor(TestPage.t6, Checkers.isName('li'), isRoot));

  Checkers.checkOpt(Optional.some(TestPage.d1), SelectorFind.ancestor(TestPage.t6, 'div', isRoot));
  Checkers.checkOpt<HTMLDivElement>(Optional.some(TestPage.d1), PredicateFind.ancestor(TestPage.t6, Checkers.isName('div'), isRoot));

  checkNone(SelectorFind.closest(TestPage.t6, 'li', isRoot));
  checkNone(SelectorFind.closest(TestPage.t6, 'ol,ul', isRoot));
  checkNone(SelectorFind.closest(TestPage.d1, 'ol,ul', isRoot));
  checkNone(PredicateFind.closest(TestPage.t6, Checkers.isName('li'), isRoot));
  checkNone(PredicateFind.closest(TestPage.d1, Checkers.isName('li'), isRoot));

  Checkers.checkOpt(Optional.some(TestPage.d1), SelectorFind.closest(TestPage.t6, 'div', isRoot));
  Checkers.checkOpt(Optional.some(TestPage.d1), SelectorFind.closest(TestPage.d1, 'div', isRoot));
  Checkers.checkOpt(Optional.some(TestPage.d1), PredicateFind.closest(TestPage.t6, Checkers.isName('div'), isRoot));
  Checkers.checkOpt(Optional.some(TestPage.d1), PredicateFind.closest(TestPage.d1, Checkers.isName('div'), isRoot));

  Checkers.checkList([ TestPage.d1 ], SelectorFilter.ancestors(TestPage.p3, '*', isRoot));
  Checkers.checkList([ TestPage.d1 ], PredicateFilter.ancestors(TestPage.p3, Fun.always, isRoot));

  Assert.eq('', false, SelectorExists.closest(TestPage.p3, 'li', isRoot));
  Assert.eq('', false, SelectorExists.closest(TestPage.p3, 'ol,ul', isRoot));
  Assert.eq('', false, PredicateExists.closest(TestPage.p3, Checkers.isName('li'), isRoot));

  Assert.eq('', true, SelectorExists.closest(TestPage.p3, 'div', isRoot));
  Assert.eq('', true, SelectorExists.closest(TestPage.d1, 'div', isRoot));
  Assert.eq('', true, PredicateExists.closest(TestPage.p3, Checkers.isName('div'), isRoot));
  Assert.eq('', true, PredicateExists.closest(TestPage.d1, Checkers.isName('div'), isRoot));

  Assert.eq('', false, SelectorExists.ancestor(TestPage.p3, 'li', isRoot));
  Assert.eq('', false, SelectorExists.ancestor(TestPage.p3, 'ol,ul', isRoot));
  Assert.eq('', false, PredicateExists.ancestor(TestPage.p3, Checkers.isName('li'), isRoot));

  Assert.eq('', true, SelectorExists.ancestor(TestPage.p3, 'div', isRoot));
  Assert.eq('', true, PredicateExists.ancestor(TestPage.p3, Checkers.isName('div'), isRoot));

  Checkers.checkList([ TestPage.d1 ], Traverse.parents(TestPage.p3, isRoot));
  Checkers.checkList([ TestPage.p3, TestPage.d1 ], Traverse.parents(TestPage.t6, isRoot));

  Remove.remove(TestPage.container);
});

import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Optional } from "@hugerte/katamari";
import { SugarElement, SugarNode, Traverse } from "@hugerte/sugar";

import * as DomLook from "hugerte/robin/api/dom/DomLook";
import * as DomParent from "hugerte/robin/api/dom/DomParent";
import * as DomStructure from "hugerte/robin/api/dom/DomStructure";
import * as BrowserCheck from "hugerte/robin/test/BrowserCheck";

UnitTest.test('BlockTest', () => {
  const check = (expected: string, input: string, look: (e: SugarElement) => Optional<SugarElement>) => {
    BrowserCheck.run(input, (node) => {
      const actual = DomParent.sharedOne(look, [ node ]);
      actual.fold(() => {
        Assert.fail('Expected a common ' + expected + ' tag');
      }, (act) => {
        Assert.eq('', expected, SugarNode.name(act));
      });
    });
  };

  const checkNone = (input: string, look: (e: SugarElement) => Optional<SugarElement>) => {
    BrowserCheck.run(input, (node) => {
      const actual = DomParent.sharedOne(look, [ node ]);
      actual.each((a) => {
        Assert.fail('Expected no common tag matching the look. Received: ' + SugarNode.name(a));
      });
    });
  };

  check('p', '<p>this<span class="me"> is it </span></p>', DomLook.selector('p'));
  checkNone('<p>this<span class="me"> is it</span></p>', DomLook.selector('blockquote'));

  check('p', '<p>this<span class="me"> is it </span></p>', DomLook.predicate((element) => {
    return SugarNode.name(element) === 'p';
  }));

  check('p', '<p>this<span class="me"> is it </span></p>', DomLook.predicate(DomStructure.isBlock));

  BrowserCheck.run('<p>this<span class="child"> is it </span></p>', (node) => {
    const actual = DomParent.sharedOne(DomLook.exact(Traverse.parent(node).getOrDie()), [ node ]);
    actual.fold(() => {
      Assert.fail('Expected a common tag');
    }, (act) => {
      Assert.eq('', 'span', SugarNode.name(act));
    });
  });
});

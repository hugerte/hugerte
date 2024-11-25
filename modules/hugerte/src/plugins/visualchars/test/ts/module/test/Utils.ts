import { ApproxStructure, StructAssert } from "@hugerte/agar";
import { Unicode } from "@hugerte/katamari";
import { TinyAssertions } from "@hugerte/wrap-mcagar";

import Editor from 'hugerte/core/api/Editor';

const assertStruct = (editor: Editor, paraStruct: StructAssert[]): void =>
  TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, _str) => s.element('body', {
    children: [
      s.element('p', {
        children: paraStruct
      })
    ]
  })));

const assertSpanStruct = (editor: Editor): void => assertStruct(editor, ApproxStructure.build((s, str) => [
  s.text(str.is('a')),
  s.element('span', {
    children: [
      s.text(str.is(Unicode.nbsp))
    ]
  }),
  s.element('span', {
    children: [
      s.text(str.is(Unicode.nbsp))
    ]
  }),
  s.text(str.is('b'))
]));

const assertNbspStruct = (editor: Editor): void => assertStruct(editor, ApproxStructure.build((s, str) => [
  s.text(str.is('a')),
  s.text(str.is(Unicode.nbsp)),
  s.text(str.is(Unicode.nbsp)),
  s.text(str.is('b'))
]));

export {
  assertStruct,
  assertNbspStruct,
  assertSpanStruct
};

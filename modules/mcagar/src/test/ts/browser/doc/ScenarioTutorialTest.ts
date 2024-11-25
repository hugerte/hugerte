import { Arbitraries, Assertions, Pipeline, Step, UiFinder } from "@hugerte/agar";
import { UnitTest } from '@ephox/bedrock-client';
import { Fun } from "@hugerte/katamari";
import { SugarElement } from "@hugerte/sugar";

import { Editor } from 'ephox/mcagar/alien/EditorTypes';
import { TinyApis } from 'ephox/mcagar/api/pipeline/TinyApis';
import * as TinyLoader from 'ephox/mcagar/api/pipeline/TinyLoader';
import { TinyScenarios } from 'ephox/mcagar/api/pipeline/TinyScenarios';
import { TinyDom } from 'ephox/mcagar/api/TinyDom';

UnitTest.asynctest('Tutorial: Property Testing with HugeRTE', (success, failure) => {

  const sAssertion = (editor: Editor, body: SugarElement<Node>) => Step.sync(() => {
    const strongs = UiFinder.findAllIn(body, 'strong');
    Assertions.assertEq('There should be no strong tags', 0, strongs.length);
    const editorContent1 = editor.getContent();

    editor.setContent(editorContent1);
    const editorContent2 = editor.getContent();
    Assertions.assertEq('The content should be the same', editorContent1, editorContent2);
  });

  TinyLoader.setupLight((editor, loadSuccess, loadFailure) => {
    const apis = TinyApis(editor);
    const scenarios = TinyScenarios(editor);
    const body = TinyDom.fromDom(editor.getBody());

    Pipeline.async({}, [
      apis.sFocus(),
      scenarios.sAsyncProperty('tutorial spec', Arbitraries.content('inline', {
        inline: {
          tags: {
            strong: { weight: 0 },
            b: { weight: 0 }
          }
        }
      }), sAssertion(editor, body), {
        scenario: {
          exclusions: {
            containers: Fun.never
          }
        },
        property: {
          numRuns: 100
        }
      })
    ], loadSuccess, loadFailure);

  }, {
    base_url: '/project/hugerte/js/hugerte'
  }, success, failure);
});

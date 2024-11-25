import { Assertions, Chain, Pipeline } from "@hugerte/agar";
import { UnitTest } from '@ephox/bedrock-client';

import * as McEditor from 'ephox/mcagar/api/McEditor';
import { ApiChains } from 'ephox/mcagar/api/pipeline/ApiChains';

UnitTest.asynctest('EditorTest', (success, failure) => {
  const cAssertEditorExists = Chain.op((editor) => {
    Assertions.assertEq('asserting that editor is truthy', true, !!editor);
  });

  Pipeline.async({}, [
    Chain.asStep({}, [
      McEditor.cFromSettings({ base_url: '/project/hugerte/js/hugerte', inline: true }),
      ApiChains.cFocus,
      cAssertEditorExists,
      McEditor.cRemove
    ])
  ], success, failure);
});

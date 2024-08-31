import { Assertions, Chain, Pipeline } from '@hugemce/agar';
import { UnitTest } from '@ephox/bedrock-client';

import * as McEditor from 'hugemce/mcagar/api/McEditor';
import { ApiChains } from 'hugemce/mcagar/api/pipeline/ApiChains';

UnitTest.asynctest('EditorTest', (success, failure) => {
  const cAssertEditorExists = Chain.op((editor) => {
    Assertions.assertEq('asserting that editor is truthy', true, !!editor);
  });

  Pipeline.async({}, [
    Chain.asStep({}, [
      McEditor.cFromSettings({ base_url: '/project/tinymce/js/tinymce', inline: true }),
      ApiChains.cFocus,
      cAssertEditorExists,
      McEditor.cRemove
    ])
  ], success, failure);
});

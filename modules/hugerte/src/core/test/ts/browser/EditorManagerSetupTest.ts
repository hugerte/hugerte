import { afterEach, beforeEach, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import EditorManager from 'hugerte/core/api/EditorManager';

import * as ViewBlock from '../module/test/ViewBlock';

const storeState = () => {
  // Store the original data
  const origBaseURL = EditorManager.baseURL;
  const origBaseURI = EditorManager.baseURI;
  const origSuffix = EditorManager.suffix;
  const origDocumentBaseURL = EditorManager.documentBaseURL;
  const origHugeRTE = (window as any).hugerte;
  delete (window as any).hugerte;

  return () => {
    // Restore the original values
    EditorManager.baseURL = origBaseURL;
    EditorManager.baseURI = origBaseURI;
    EditorManager.documentBaseURL = origDocumentBaseURL;
    EditorManager.suffix = origSuffix;
    (window as any).hugerte = origHugeRTE;
  };
};

describe('browser.hugerte.core.EditorManagerSetupTest', () => {
  const viewBlock = ViewBlock.bddSetup();
  let restoreState: () => void;

  beforeEach(() => restoreState = storeState());
  afterEach(() => restoreState());

  it('script baseURL and suffix with script in svg', () => {
    viewBlock.update('<svg><script>!function(){}();</script></svg><script src="http://localhost/nonexistant/hugerte.min.js" type="application/javascript"></script>');
    EditorManager.setup();
    assert.equal(EditorManager.baseURL, 'http://localhost/nonexistant', 'BaseURL is interpreted from the script src');
    assert.equal(EditorManager.suffix, '.min', 'Suffix is interpreted from the script src');
  });
});

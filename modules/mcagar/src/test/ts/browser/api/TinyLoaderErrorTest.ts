import { UnitTest } from '@ephox/bedrock-client';

import * as TinyLoader from "hugerte/mcagar/api/pipeline/TinyLoader";

UnitTest.asynctest('TinyLoader should fail (instead of timeout) when exception is thrown in callback function', (success, failure) => {
  TinyLoader.setup(() => {
    throw new Error('boo!');
  }, { base_url: '/project/hugerte/js/hugerte' }, failure, success);
});

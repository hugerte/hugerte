import { Assert, UnitTest } from '@ephox/bedrock-client';

import { Gene } from "hugerte/boss/api/Gene";
import * as Creator from "hugerte/boss/mutant/Creator";

UnitTest.test('CreatorTest', () => {
  Assert.eq('', Gene('clone**<c>', 'cat', []), Creator.clone(Gene('c', 'cat', [ Gene('kitten', 'kitten') ])));
});

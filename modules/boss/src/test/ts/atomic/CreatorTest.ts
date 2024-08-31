import { Assert, UnitTest } from '@hugemce/bedrock-client';

import { Gene } from 'hugemce/boss/api/Gene';
import * as Creator from 'hugemce/boss/mutant/Creator';

UnitTest.test('CreatorTest', () => {
  Assert.eq('', Gene('clone**<c>', 'cat', []), Creator.clone(Gene('c', 'cat', [ Gene('kitten', 'kitten') ])));
});

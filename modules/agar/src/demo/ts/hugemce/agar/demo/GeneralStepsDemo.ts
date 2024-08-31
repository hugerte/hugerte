import { SugarElement } from '@hugemce/sugar';

import { Pipeline } from 'hugemce/agar/api/Pipeline';
import { Step } from 'hugemce/agar/api/Step';
import * as DemoContainer from 'hugemce/agar/demo/DemoContainer';

export const demo = (): void => {
  DemoContainer.init(
    'General Steps Demo',
    (success, failure) => {
      const outcome = SugarElement.fromTag('div');

      Pipeline.async({}, [
        Step.wait(1000),
        Step.fail('I am an error')
      ], success, failure);

      return [ outcome ];
    }
  );
};

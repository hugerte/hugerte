import { SugarElement } from "@hugerte/sugar";

import { Pipeline } from "hugerte/agar/api/Pipeline";
import { Step } from "hugerte/agar/api/Step";
import * as DemoContainer from "hugerte/agar/demo/DemoContainer";

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

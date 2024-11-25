import * as DemoContainer from "hugerte/agar/demo/DemoContainer";

export const demo = (): void => {
  DemoContainer.init(
    'Mouse testing',
    (success, failure) => {
      failure('Not implemented.');

      return [ ];
    }
  );
};

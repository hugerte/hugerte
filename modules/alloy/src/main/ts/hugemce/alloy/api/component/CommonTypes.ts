import { Result } from '@hugemce/katamari';

import { AlloyComponent } from './ComponentApi';

export type LazySink = (comp: AlloyComponent) => Result<AlloyComponent, any>;

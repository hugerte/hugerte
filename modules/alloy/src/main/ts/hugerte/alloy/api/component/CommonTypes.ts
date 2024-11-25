import { Result } from "@hugerte/katamari";

import { AlloyComponent } from './ComponentApi';

export type LazySink = (comp: AlloyComponent) => Result<AlloyComponent, any>;

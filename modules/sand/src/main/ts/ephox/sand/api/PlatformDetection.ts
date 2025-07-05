import { Thunk } from '@ephox/katamari';

import { PlatformDetection } from '../core/PlatformDetection';

const mediaMatch = (query: string) => window.matchMedia(query).matches;

// IMPORTANT: Must be in a thunk, otherwise rollup thinks calling this immediately
// causes side effects and won't tree shake this away
// Note: navigator.userAgentData is not part of the native typescript types yet
let platform = Thunk.cached(() => PlatformDetection.detect(navigator.userAgent, (navigator as any).userAgentData, mediaMatch));

export const detect = (): PlatformDetection => platform();

// TODO ideally where we're using override, we should just be running the tests on a touch device...note that also computers can be touch, but is mine considered one?
export const override = (overrides: Partial<PlatformDetection>): void => {
  platform = () => ({
    ...detect(),
    ...overrides
  });
};

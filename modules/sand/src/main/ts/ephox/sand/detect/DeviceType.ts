

import { Browser } from '../core/Browser';
import { OperatingSystem } from '../core/OperatingSystem';

export interface DeviceType {
  readonly isiPad: () => boolean;
  readonly isiPhone: () => boolean;
  readonly isTablet: () => boolean;
  readonly isPhone: () => boolean;
  readonly isTouch: () => boolean;
  readonly isAndroid: () => boolean;
  readonly isiOS: () => boolean;
  readonly isWebView: () => boolean;
  readonly isDesktop: () => boolean;
}

export const DeviceType = (os: OperatingSystem, browser: Browser, userAgent: string, mediaMatch: (query: string) => boolean): DeviceType => {
  const isiPad = os.isiOS() && /ipad/i.test(userAgent) === true;
  const isiPhone = os.isiOS() && !isiPad;
  const isMobile = os.isiOS() || os.isAndroid();
  const isTouch = isMobile || mediaMatch('(pointer:coarse)');
  const isTablet = isiPad || !isiPhone && isMobile && mediaMatch('(min-device-width:768px)');
  const isPhone = isiPhone || isMobile && !isTablet;

  const iOSwebview = browser.isSafari() && os.isiOS() && /safari/i.test(userAgent) === false;
  const isDesktop = !isPhone && !isTablet && !iOSwebview;

  return {
    isiPad: () => isiPad,
    isiPhone: () => isiPhone,
    isTablet: () => isTablet,
    isPhone: () => isPhone,
    isTouch: () => isTouch,
    isAndroid: os.isAndroid,
    isiOS: os.isiOS,
    isWebView: () => iOSwebview,
    isDesktop: () => isDesktop
  };
};

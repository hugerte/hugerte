export interface PlatformInfo {
  readonly name: string;
  readonly versionRegexes: RegExp[];
  readonly search: (uastring: string) => boolean;
  readonly brand?: string;
}

const normalVersionRegex = /.*?version\/\ ?([0-9]+)\.([0-9]+).*/;

const checkContains = (target: string) => (uastring: string) => uastring.includes(target);

const browsers: PlatformInfo[] = [
  // This is legacy Edge
  {
    name: 'Edge',
    versionRegexes: [ /.*?edge\/ ?([0-9]+)\.([0-9]+)$/ ],
    search: (uastring: string): boolean => {
      return uastring.includes('edge/') && uastring.includes('chrome') && uastring.includes('safari') && uastring.includes('applewebkit');
    }
  },
  // This is Google Chrome and Chromium Edge
  {
    name: 'Chromium',
    brand: 'Chromium',
    versionRegexes: [ /.*?chrome\/([0-9]+)\.([0-9]+).*/, normalVersionRegex ],
    search: (uastring: string): boolean => {
      return uastring.includes('chrome') && !uastring.includes('chromeframe');
    }
  },
  {
    name: 'IE',
    versionRegexes: [ /.*?msie\ ?([0-9]+)\.([0-9]+).*/, /.*?rv:([0-9]+)\.([0-9]+).*/ ],
    search: (uastring: string): boolean => {
      return uastring.includes('msie') || uastring.includes('trident');
    }
  },
  // TODO INVESTIGATE and search for all INVESTIGATE: Is this still the Opera user agent?
  {
    name: 'Opera',
    versionRegexes: [ normalVersionRegex, /.*?opera\/([0-9]+)\.([0-9]+).*/ ],
    search: checkContains('opera')
  },
  {
    name: 'Firefox',
    versionRegexes: [ /.*?firefox\/\ ?([0-9]+)\.([0-9]+).*/ ],
    search: checkContains('firefox')
  },
  {
    name: 'Safari',
    versionRegexes: [ normalVersionRegex, /.*?cpu os ([0-9]+)_([0-9]+).*/ ],
    search: (uastring: string): boolean => {
      return (uastring.includes('safari') || uastring.includes('mobile/')) && uastring.includes('applewebkit');
    }
  }
];

const oses: PlatformInfo[] = [
  {
    name: 'Windows',
    search: checkContains('win'),
    versionRegexes: [ /.*?windows\ nt\ ?([0-9]+)\.([0-9]+).*/ ]
  },
  {
    name: 'iOS',
    search: (uastring: string): boolean => {
      return uastring.includes('iphone') || uastring.includes('ipad');
    },
    versionRegexes: [ /.*?version\/\ ?([0-9]+)\.([0-9]+).*/, /.*cpu os ([0-9]+)_([0-9]+).*/, /.*cpu iphone os ([0-9]+)_([0-9]+).*/ ]
  },
  {
    name: 'Android',
    search: checkContains('android'),
    versionRegexes: [ /.*?android\ ?([0-9]+)\.([0-9]+).*/ ]
  },
  {
    name: 'macOS',
    search: checkContains('mac os x'),
    versionRegexes: [ /.*?mac\ os\ x\ ?([0-9]+)_([0-9]+).*/ ]
  },
  {
    name: 'Linux',
    search: checkContains('linux'),
    versionRegexes: [ ]
  },
  { name: 'Solaris',
    search: checkContains('sunos'),
    versionRegexes: [ ]
  },
  {
    name: 'FreeBSD',
    search: checkContains('freebsd'),
    versionRegexes: [ ]
  },
  {
    name: 'ChromeOS',
    search: checkContains('cros'),
    versionRegexes: [ /.*?chrome\/([0-9]+)\.([0-9]+).*/ ]
  }
];

export const PlatformInfo = {
  browsers,
  oses,
};

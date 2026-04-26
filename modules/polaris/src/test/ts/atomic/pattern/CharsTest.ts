import { Assert, UnitTest } from '@ephox/bedrock-client';


import * as Chars from 'ephox/polaris/pattern/Chars';

UnitTest.test('CharsTest', () => {
  const supported = [ 'fr', 'en_au', 'pt', 'it', 'nl', 'en_uk', 'pt_pt', 'de', 'nb', 'en_br', 'sv', 'da', 'en', 'es', 'en_gb', 'fi', 'en_us' ];

  interface Extra {
    label: string;
    html: string;
    chars: string;
  }

  const extras: Record<string, Extra> = {
    fr: {
      label: 'French language',
      html: 'http://character-code.com/french-html-codes.php || https://www.cs.tut.fi/~jkorpela/html/french.html',
      chars: 'àÀâÂèÈéÉêÊëËîÎïÏôÔùÙûÛüÜÿŸçÇœŒ' +
             'ÀàÂâÆæÇçÈèÉéÊêËëÎîÏïÔôŒœÙùÛûÜü'
    },
    en_au: {
      label: 'English (Aus)',
      html: '<known>',
      chars: ''
    },
    pt: {
      label: 'Brazilian Portuguese',
      html: 'http://www.geocities.ws/click2speak/unicode/chars_pt.html',
      chars: 'ÀàÁáÂâÃãÉéÊêÍíÒòÓóÔôÕõÚúÜüÇç'

    },
    it: {
      label: 'Italian',
      html: 'https://mcaboni.wordpress.com/2012/01/09/107/',
      chars: 'àÈèéìòù'
    },
    nl: {
      label: 'Dutch',
      html: 'http://symbolcodes.tlt.psu.edu/bylanguage/dutch.html',
      chars: 'ÁÉÍÓÚÝ áéíóúý ÄËÏÖÜŸ äëïöüÿ ÀÈÌÒÙ àèìòù ÂÊÎÔÛ âêîôû'
    },
    en_uk: {
      label: 'English (UK)',
      html: '<known>',
      chars: ''
    },
    pt_pt: {
      label: 'European Portuguese',
      html: 'http://www.geocities.ws/click2speak/unicode/chars_pt.html',
      chars: 'ÀàÁáÂâÃãÉéÊêÍíÓóÔôÕõÚúÇç'
    },
    de: {
      label: 'German',
      html: 'http://character-code.com/german-html-codes.php',
      // TINY-7908: Including \u00AD (soft hyphens) because they appear to be more common in German text
      chars: 'ÄäÉéÖöÜüß\u00AD'
    },
    nb: {
      label: 'Norwegian',
      html: 'http://symbolcodes.tlt.psu.edu/bylanguage/nordic.html',
      chars: 'ÅåÆæØø'
    },
    en_br: {
      label: 'English (British)',
      html: '<known>',
      chars: ''
    },
    sv: {
      label: 'Swedish',
      html: 'http://symbolcodes.tlt.psu.edu/bylanguage/nordic.html',
      chars: 'ÅåÄäÖö'
    },
    da: {
      label: 'Danish',
      html: 'http://symbolcodes.tlt.psu.edu/bylanguage/nordic.html',
      chars: 'ÅåÆæØø'
    },
    en: {
      label: 'English',
      html: '<known>',
      chars: ''
    },
    es: {
      label: 'Spanish',
      html: 'http://character-code.com/spanish-html-codes.php',
      chars: 'ÁáÉéÍíÑñÓóÚúÜü'
    },
    en_gb: {
      label: 'English (GB)',
      html: '<known>',
      chars: ''
    },
    fi: {
      label: 'Finnish',
      html: 'http://symbolcodes.tlt.psu.edu/bylanguage/nordic.html',
      chars: 'ÅåÄäÖö'
    },
    en_us: {
      label: 'English (US)',
      html: '<known>',
      chars: ''
    }
  };

  const regex = new RegExp(Chars.wordchar(), '');

  const checkAllKnown = (label: string, str: string) => {
    const chars = str.split('');
    const breaks = chars.filter((c) =) {
      return !regex.test(c);
    });

    const leftovers = breaks.join('').trim();
    Assert.eq(
      'Test: ' + label + '\nExpected all characters in: \n\n"' + str + '" to be known. \nUnknown: ' + leftovers,
      0,
      leftovers.length
    );
  };

  supported.forEach((code) =) {
    const info = extras[code];
    checkAllKnown(info.label, info.chars);
  });
});

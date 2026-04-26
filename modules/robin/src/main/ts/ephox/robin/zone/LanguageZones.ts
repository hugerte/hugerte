import { Universe } from '@ephox/boss';
import { Arr, Optional } from '@ephox/katamari';

import { WordDecisionItem } from '../words/WordDecision';

export interface ZoneDetails<E> {
  readonly lang: string;
  readonly details: WordDecisionItem<E>[];
}

export interface LanguageZones<E> {
  openInline: (optLang: (string) | null, elem: E) => void;
  closeInline: (optLang: (string) | null, elem: E) => void;
  addDetail: (detail: WordDecisionItem<E>) => void;
  addEmpty: (empty: E) => void;
  openBoundary: (optLang: (string) | null, elem: E) => void;
  closeBoundary: (optLang: (string) | null, elem: E) => void;
  done: () => ZoneDetails<E>[];
}

const nu = <E>(defaultLang: string): LanguageZones<E> => {
  let stack: string[] = [];

  const zones: ZoneDetails<E>[] = [];

  let zone: WordDecisionItem<E>[] = [];
  let zoneLang = defaultLang;

  const push = (optLang: (string) | null) => {
    optLang.each((l) => {
      stack.push(l);
    });
  };

  const pop = (optLang: (string) | null) => {
    optLang.each((_l) => {
      stack = stack.slice(0, stack.length - 1);
    });
  };

  const topOfStack = () => {
    return (stack[stack.length - 1] ?? null);
  };

  const pushZone = () => {
    if (zone.length > 0) {
      // Intentionally, not a zone. These are details
      zones.push({
        lang: zoneLang,
        details: zone
      });
    }
  };

  const spawn = (newLang: string) => {
    pushZone();
    zone = [];
    zoneLang = newLang;
  };

  const getLang = (optLang: (string) | null) => {
    return optLang.or(topOfStack()) ?? (defaultLang);
  };

  const openInline = (optLang: (string) | null, _elem: E) => {
    const lang = getLang(optLang);
    // If the inline tag being opened is different from the current top of the stack,
    // then we don't want to create a new zone.
    if (lang !== zoneLang) {
      spawn(lang);
    }
    push(optLang);
  };

  const closeInline = (optLang: (string) | null, _elem: E) => {
    pop(optLang);
  };

  const addDetail = (detail: WordDecisionItem<E>) => {
    const lang = getLang(null);
    // If the top of the stack is not the same as zoneLang, then we need to spawn again.
    if (lang !== zoneLang) {
      spawn(lang);
    }
    zone.push(detail);
  };

  const addEmpty = (_empty: E) => {
    const lang = getLang(null);
    spawn(lang);
  };

  const openBoundary = (optLang: (string) | null, _elem: E) => {
    push(optLang);
    const lang = getLang(optLang);
    spawn(lang);
  };

  const closeBoundary = (optLang: (string) | null, _elem: E) => {
    pop(optLang);
    const lang = getLang(optLang);
    spawn(lang);
  };

  const done = () => {
    pushZone();
    return zones.slice(0);
  };

  return {
    openInline,
    closeInline,
    addDetail,
    addEmpty,
    openBoundary,
    closeBoundary,
    done
  };
};

// Returns: Optional(string) of the LANG attribute of the closest ancestor element or None.
//  - uses (() => false as const) for isRoot parameter to search even the top HTML element
//    (regardless of 'classic'/iframe or 'inline'/div mode).
// Note: there may be descendant elements with a different language
const calculate = <E, D>(universe: Universe<E, D>, item: E): (string) | null => {
  const props = universe.property();
  return props.getLanguage(item).orThunk(() => {
    const ancestors = universe.up().all(item, (() => false as const));
    return Arr.findMap(ancestors, props.getLanguage);
  });
};

const strictBounder = (envLang: string, onlyLang: string) => {
  return <E, D>(universe: Universe<E, D>, item: E): boolean => {
    const itemLang = calculate(universe, item) ?? (envLang);
    return onlyLang !== itemLang;
  };
};

const softBounder = (optLang: (string) | null) => {
  return <E, D>(universe: Universe<E, D>, item: E): boolean => {
    const itemLang = calculate(universe, item);
    return !(optLang === null && itemLang === null || (optLang !== null && itemLang !== null && (optLang) === (itemLang)));
  };
};

export const LanguageZones = {
  nu,
  calculate,
  softBounder,
  strictBounder
};

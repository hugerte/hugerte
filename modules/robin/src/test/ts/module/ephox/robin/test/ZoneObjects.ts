import { Logger } from '@ephox/agar';
import { Assert } from '@ephox/bedrock-client';
import { Gene, TestUniverse } from '@ephox/boss';


import { LanguageZones } from 'ephox/robin/zone/LanguageZones';
import { Zone } from 'ephox/robin/zone/Zones';

export interface RawZone {
  lang: string;
  elements: string[];
  words: string[];
}

const rawOne = (universe: TestUniverse, zone: Zone<Gene>): RawZone => {
  return {
    lang: zone.lang,
    elements: zone.elements.map((elem) => {
      return elem.id;
    }),
    words: zone.words.map((w) => {
      return w.word;
    })
  };
};

const raw = (universe: TestUniverse, zones: Zone<Gene>[]): RawZone[] => {
  return zones.map((zone) => {
    return rawOne(universe, zone);
  });
};

const assertZones = (label: string, universe: TestUniverse, expected: RawZone[], zones: Zone<Gene>[]): void => {
  const rawActual = raw(universe, zones);
  Assert.eq(label + '\nChecking zones: ', expected, rawActual);
};

const assertProps = (label: string, universe: TestUniverse, zones: Zone<Gene>[]): void => {
  zones.forEach((zone) => {
    const elements = zone.elements;
    if (elements.length === 0) {
      return;
    }

    const first = elements[0];

    Logger.sync(
      '\nProperty test for zone: ' + JSON.stringify(rawOne(universe, zone), null, 2),
      () => {
        // Check languages all match the zone language
        elements.forEach((x) => {
          Assert.eq(
            'Checking everything in ' + label + ' has same language. Item: ' + x.id,
            LanguageZones.calculate(universe, x) ?? 'none', zone.lang
          );
          Assert.eq(
            'Check that everything in the ' + label + ' is a text node',
            true,
            universe.property().isText(x)
          );
        });

        // Check block tags match across zones
        const blockParent = universe.up().predicate(first, universe.property().isBoundary).getOrDie('No block parent tag found');
        elements.forEach((x) => {
          Assert.eq(
            'All block ancestor tags should be the same as the original',
            blockParent,
            universe.up().predicate(x, universe.property().isBoundary).getOrDie('No block parent tag found')
          );
        });
      }
    );
  });
};

export { raw, rawOne, assertZones, assertProps };

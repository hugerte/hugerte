import { describe, it } from '@hugemce/bedrock-client';
import { Unicode } from '@hugemce/katamari';
import { SugarElement } from '@hugemce/sugar';
import { assert } from 'chai';

import * as DomTextZones from 'hugemce/robin/api/dom/DomTextZones';
import { ZoneViewports } from 'hugemce/robin/api/general/ZoneViewports';

describe('browser.robin.zone.EntityTest', () => {
  it('TINY-7908: Soft hyphens are not treated as a word boundary', () => {
    const content = SugarElement.fromHtml('<div>some plain words and a hy&shy;phenated word</div>');
    const zones = DomTextZones.single(content, 'en-US', ZoneViewports.anything());
    const rawZones = zones.zones.map((z) => ({ lang: z.lang, words: z.words.map((w) => w.word) }));
    assert.deepEqual(rawZones, [
      { lang: 'en-US', words: [ 'some', 'plain', 'words', 'and', 'a', `hy${Unicode.softHyphen}phenated`, 'word' ] }
    ]);
  });

  it('Zero width spaces are not treated as a word boundary', () => {
    const content = SugarElement.fromHtml(`<div>some plain words with some&#xFEFF;space</div>`);
    const zones = DomTextZones.single(content, 'en-US', ZoneViewports.anything());
    const rawZones = zones.zones.map((z) => ({ lang: z.lang, words: z.words.map((w) => w.word) }));
    assert.deepEqual(rawZones, [
      { lang: 'en-US', words: [ 'some', 'plain', 'words', 'with', `some${Unicode.zeroWidth}space` ] }
    ]);
  });

  it('Non breaking spaces are treated as a word boundary', () => {
    const content = SugarElement.fromHtml(`<div>some plain words with some&nbsp;space</div>`);
    const zones = DomTextZones.single(content, 'en-US', ZoneViewports.anything());
    const rawZones = zones.zones.map((z) => ({ lang: z.lang, words: z.words.map((w) => w.word) }));
    assert.deepEqual(rawZones, [
      { lang: 'en-US', words: [ 'some', 'plain', 'words', 'with', 'some', 'space' ] }
    ]);
  });
});

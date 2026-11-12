import { UiFinder } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { Attribute, SelectorFilter, SugarElement, SugarHead } from '@ephox/sugar';
import { assert } from 'chai';

import StyleSheetLoader from 'hugerte/core/api/dom/StyleSheetLoader';

describe('browser.hugerte.core.dom.StyleSheetLoaderTest', () => {
  const contentCss = '/project/hugerte/js/hugerte/skins/content/default/content.css';
  const skinCss = '/project/hugerte/js/hugerte/skins/ui/oxide/skin.css';
  const rawCssKey = 'ui/default/skin.css';
  const rawCss = '.raw-css-test { color: red; }';
  let loader: StyleSheetLoader;

  const baseLinkExists = (url: string, head: SugarElement<HTMLHeadElement>) => {
    const links = SelectorFilter.descendants(head, `link[href="${url}"]`);
    assert.lengthOf(links, 1, 'Should have one link loaded');
    assert.equal(Attribute.get(links[0], 'referrerPolicy'), 'origin', 'Should have referrer policy attribute');
    assert.equal(Attribute.get(links[0], 'crossorigin'), 'anonymous', 'Should have crossorigin attribute');
  };

  const linkExists = (url: string) => baseLinkExists(url, SugarHead.head());

  const linkNotExists = (url: string) => UiFinder.notExists(SugarHead.head(), `link[href="${url}"]`);

  const getStyles = (css: string) =>
    SelectorFilter.descendants<HTMLStyleElement>(SugarHead.head(), 'style').filter((style) => style.dom.innerHTML === css);

  const styleExists = (css: string) => assert.lengthOf(getStyles(css), 1, 'Should have one style loaded');

  const styleNotExists = (css: string) => assert.lengthOf(getStyles(css), 0, 'Should have no style loaded');

  const pLoadUrl = (url: string): Promise<void> =>
    loader.load(url);

  const pLoadAllUrls = (urls: string[]): Promise<string[]> =>
    loader.loadAll(urls);

  const unloadUrl = (url: string) => loader.unload(url);

  const unloadAllUrls = (urls: string[]) => loader.unloadAll(urls);

  const loadRawCss = (key: string, css: string) => loader.loadRawCss(key, css);

  const unloadRawCss = (key: string) => loader.unloadRawCss(key);

  before(() => {
    loader = StyleSheetLoader(document, {
      maxLoadTime: 500,
      contentCssCors: true,
      referrerPolicy: 'origin'
    });
  });

  it('TINY-3926: Load and then unload removes the loaded stylesheet', async () => {
    await pLoadUrl(contentCss);
    linkExists(contentCss);
    unloadUrl(contentCss);
    linkNotExists(contentCss);
  });

  it('TINY-3926: Load and then unload all urls should leave no stylesheets', async () => {
    await pLoadAllUrls([ contentCss, skinCss ]);
    linkExists(contentCss);
    linkExists(skinCss);
    unloadAllUrls([ skinCss, contentCss ]);
    linkNotExists(contentCss);
    linkNotExists(skinCss);
  });

  it('TINY-3926: Unload removes loaded stylesheets, but only on last reference', async () => {
    // Load 2 links and ensure only one link is loaded
    await pLoadUrl(contentCss);
    await pLoadUrl(contentCss);
    linkExists(contentCss);
    // Unload once shouldn't remove the link
    unloadUrl(contentCss);
    linkExists(contentCss);
    // Unload a second time should remove since the stylesheet was loaded twice
    unloadUrl(contentCss);
    linkNotExists(contentCss);
  });

  it('Unload removes loaded raw css, but only on last reference', () => {
    // Load 2 styles and ensure only one style is loaded
    loadRawCss(rawCssKey, rawCss);
    loadRawCss(rawCssKey, rawCss);
    styleExists(rawCss);
    // Unload once shouldn't remove the style
    unloadRawCss(rawCssKey);
    styleExists(rawCss);
    // Unload a second time should remove since the style was loaded twice
    unloadRawCss(rawCssKey);
    styleNotExists(rawCss);
  });
});

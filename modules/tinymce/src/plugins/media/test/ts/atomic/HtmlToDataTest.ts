import { context, describe, it } from '@hugemce/bedrock-client';
import { assert } from 'chai';

import * as HtmlToData from 'tinymce/plugins/media/core/HtmlToData';
import { MediaData } from 'tinymce/plugins/media/core/Types';

describe('atomic.tinymce.plugins.media.core.HtmlToDataTest', () => {
  const testHtmlToData = (html: string, expected: MediaData) => {
    const actual = HtmlToData.htmlToData(html);
    assert.deepEqual(actual, expected);
  };

  context('hugemce embeds', () => {
    it('Convert hugemce embed to data', () => testHtmlToData(
      '<div data-hugemce-embed-iri="a"></div>',
      {
        type: 'hugemce-embed-iri',
        source: 'a',
        altsource: '',
        poster: '',
        width: '',
        height: ''
      }
    ));

    it('Convert hugemce embed with styles to data', () => testHtmlToData(
      '<div data-hugemce-embed-iri="a" style="max-width: 300px; max-height: 200px"></div>',
      {
        type: 'hugemce-embed-iri',
        source: 'a',
        altsource: '',
        poster: '',
        width: '300',
        height: '200'
      }
    ));
  });

  context('iframes', () => {
    it('Convert iframe with URL without protocol to data', () => testHtmlToData(
      '<iframe src="www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>',
      {
        src: 'www.youtube.com/embed/b3XFjWInBog',
        width: '560',
        height: '314',
        allowfullscreen: 'allowfullscreen',
        type: 'iframe',
        source: 'www.youtube.com/embed/b3XFjWInBog',
        altsource: '',
        poster: ''
      }
    ));

    it('Convert iframe with protocol relative URL to data', () => testHtmlToData(
      '<iframe src="//www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>',
      {
        src: '//www.youtube.com/embed/b3XFjWInBog',
        width: '560',
        height: '314',
        allowfullscreen: 'allowfullscreen',
        type: 'iframe',
        source: '//www.youtube.com/embed/b3XFjWInBog',
        altsource: '',
        poster: ''
      }
    ));

    it('Convert iframe with http URL to data', () => testHtmlToData(
      '<iframe src="http://www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>',
      {
        src: 'http://www.youtube.com/embed/b3XFjWInBog',
        width: '560',
        height: '314',
        allowfullscreen: 'allowfullscreen',
        type: 'iframe',
        source: 'http://www.youtube.com/embed/b3XFjWInBog',
        altsource: '',
        poster: ''
      }
    ));

    it('Convert iframe with https URL to data', () => testHtmlToData(
      '<iframe src="https://www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>',
      {
        src: 'https://www.youtube.com/embed/b3XFjWInBog',
        width: '560',
        height: '314',
        allowfullscreen: 'allowfullscreen',
        type: 'iframe',
        source: 'https://www.youtube.com/embed/b3XFjWInBog',
        altsource: '',
        poster: ''
      }
    ));
  });
});

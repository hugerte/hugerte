const resolve = require('resolve');
const twemoji = require('twemoji');

const prettyPrint = (obj) => JSON.stringify(obj, null, 2);

const generateContent = (json, extraAttribution) => {
  const content = `window.hugerte.Resource.add('hugerte.plugins.emoticons', ${json});`;
  const attribution = `/**
 * This file bundles emoji data from emojilib by Mu-An Chiou.
 *
 * Copyright (c) 2014 Mu-An Chiou
 * @license MIT <https://opensource.org/licenses/MIT>
 * @see https://github.com/muan/emojilib/blob/main/LICENSE
 */`
  return attribution + '\n' + (extraAttribution ? extraAttribution + '\n' : '') + content;
};

const twemojiAttribution = `/**
 * Emoji artwork: Twemoji. Referenced at runtime via emoticons_images_url, not bundled here.
 *
 * Copyright 2019 Twitter, Inc and other contributors
 * @license CC-BY 4.0 <https://creativecommons.org/licenses/by/4.0/>
 * @see https://github.com/twitter/twemoji
 */`;

const getTwemojiOptions = (grunt, options) => {
  const twemojiOptions = options.twemoji || { base: '', ext: '.png' };

  const type = grunt.option('twemojiType');
  if (type === 'svg') {
    twemojiOptions.folder = 'svg';
    twemojiOptions.ext = '.svg';
  }

  return twemojiOptions;
};

module.exports = function (grunt) {
  grunt.registerTask("emojis", "Generates the emoji databases used for the emoticon plugin", function () {
    const options = grunt.config([this.name]) || {};
    const twemojiOptions = getTwemojiOptions(grunt, options);

    const emojiJson = grunt.file.read(resolve.sync('emojilib/emojis.json'));
    const emojiDatabase = JSON.parse(emojiJson);

    const emojiImageDatabase = {};
    Object.keys(emojiDatabase).forEach((name) => {
      const item = emojiDatabase[name];
      // See https://github.com/twitter/twemoji#inline-styles for the inline styles
      item.char = twemoji.parse(item.char, twemojiOptions)
        .replace('class="emoji"', 'data-emoticon="true" style="width:1em;height:1em;margin:0 .05em 0 .1em;vertical-align:-.1em"')
        .replace(/src="([^"]+)"/, (match, url) => {
          const fragments = url.split('/');
          return `src="${fragments[fragments.length - 1]}"`;
        });
      emojiImageDatabase[name] = item;
    });

    grunt.file.write('src/plugins/emoticons/main/js/emojis.js', generateContent(emojiJson));
    grunt.file.write('src/plugins/emoticons/main/js/emojiimages.js', generateContent(prettyPrint(emojiImageDatabase), twemojiAttribution));
  });
};

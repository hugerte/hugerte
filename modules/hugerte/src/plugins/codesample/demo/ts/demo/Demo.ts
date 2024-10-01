import { HugeRTE } from 'hugerte/core/api/PublicApi';

declare let hugerte: HugeRTE;

hugerte.init({
  selector: 'textarea.hugerte',
  plugins: 'codesample code',
  toolbar: 'codesample code',
  content_css: '../../../../../js/hugerte/skins/content/default/content.css',
  height: 600
});

hugerte.init({
  selector: 'div.hugerte',
  inline: true,
  plugins: 'codesample code',
  toolbar: 'codesample code',
  content_css: '../../../../../js/hugerte/skins/content/default/content.css',
  height: 600
});

export {};

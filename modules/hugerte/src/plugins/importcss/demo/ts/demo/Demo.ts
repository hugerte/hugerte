import { HugeRTE } from 'hugerte/core/api/PublicApi';

declare let hugerte: HugeRTE;

const elm = document.querySelector('.hugerte') as HTMLTextAreaElement;
elm.value = 'The format menu should show "red"';

hugerte.init({
  selector: 'textarea.hugerte',
  plugins: 'importcss code',
  toolbar: 'styles code',
  height: 600,
  content_css: '../css/rules.css'
});

export {};

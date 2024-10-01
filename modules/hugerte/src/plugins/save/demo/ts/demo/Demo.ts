import { HugeRTE } from 'hugerte/core/api/PublicApi';

declare let hugerte: HugeRTE;

hugerte.init({
  selector: 'textarea.hugerte',
  theme: 'silver',
  skin_url: '../../../../../js/hugerte/skins/ui/oxide',
  plugins: 'save code',
  toolbar: 'save code',
  height: 600
  // save_onsavecallback: () => { console.log('saved'); }
});

export {};

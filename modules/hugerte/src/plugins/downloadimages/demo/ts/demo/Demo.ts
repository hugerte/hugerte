import { HugeRTE } from 'hugerte/core/api/PublicApi';

declare let hugerte: HugeRTE;

hugerte.init({
  selector: 'textarea.hugerte',
  plugins: 'downloadimages code',
  toolbar: 'undo redo | downloadimages code',
  height: 600
});

export {};

import { HugeRTE } from 'hugerte/core/api/PublicApi';

declare let hugerte: HugeRTE;

hugerte.init({
  selector: 'div.hugerte',
  setup: (ed) => {
    ed.on('init', () => {
      const runtimeModel = ed.model;
      // eslint-disable-next-line no-console
      console.log('demo model created', runtimeModel);
    });
  }
});

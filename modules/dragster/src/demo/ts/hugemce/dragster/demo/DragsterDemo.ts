import { Css, DomEvent, Insert, SelectorFind, SugarElement } from '@hugemce/sugar';

import * as Dragger from 'hugemce/dragster/api/Dragger';
import { Sizers } from 'hugemce/dragster/demo/Sizers';
import * as Grow from 'hugemce/dragster/transform/Grow';
import * as Relocate from 'hugemce/dragster/transform/Relocate';

// const container = $('<div/>').append('Hi.');

// const dialog = Dragster();

// const titlebar = SugarElement.fromText('title', document);

// const content = (function () {
//   const text = SugarElement.fromText('This is the body of the text ...', document);
//   const p = SugarElement.fromTag('p');
//   Insert.append(p, text);
//   return p;
// })();

// dialog.setHeader(titlebar);
// dialog.setContent(content);

// // Demonstrate that dialog can change after being created.
// setTimeout(function () {
//   dialog.setHeader(SugarElement.fromText('blah'));
//   dialog.setContent(SugarElement.fromText('new content'));
// }, 5000);

// container.append(dialog.element().dom);

// $('#hugemce-ui').append(container);

// dialog.show(10, 10);

const div = SugarElement.fromTag('div');
Css.setAll(div, {
  position: 'absolute',
  left: '10px',
  top: '20px',
  width: '100px',
  height: '50px',
  background: 'blue'
});

// will need closers.
const sizers = Sizers();

DomEvent.bind(div, 'mousedown', () => {
  sizers.show();
  sizers.update(div);
  relocater.on();
});

const hugemceUi = SelectorFind.first('#hugemce-ui').getOrDie();
Insert.append(hugemceUi, div);

const neGrow = Grow.both(div);
neGrow.events.grow.bind(() => {
  sizers.hide();
  relocater.off();
});

const relocate = Relocate.both(div);
relocate.events.relocate.bind(() => {
  sizers.hide();
});

const grower = Dragger.transform(neGrow);
grower.events.stop.bind(() => {
  sizers.update(div);
  sizers.show();
  relocater.on();
});
grower.on();
DomEvent.bind(sizers.southeast().element(), 'mousedown', () => {
  grower.go(hugemceUi);
});

const relocater = Dragger.transform(relocate);
relocater.events.stop.bind(() => {
  sizers.update(div);
  sizers.show();
});
DomEvent.bind(div, 'mousedown', () => {
  relocater.go(SugarElement.fromDom(document.body));
});
relocater.off();

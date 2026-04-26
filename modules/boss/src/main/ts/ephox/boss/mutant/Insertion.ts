
import { Gene } from '../api/Gene';
import * as Detach from './Detach';
import * as Locator from './Locator';
import * as Up from './Up';

const before = (anchor: Gene, item: Gene): void => {
  anchor.parent.each((parent) => {
    const index = Locator.indexIn(parent, anchor);

    const detached = Detach.detach(Up.top(anchor), item) ?? (item);
    detached.parent = parent;
    index.each((ind) => {
      parent.children = parent.children.slice(0, ind).concat([ detached ]).concat(parent.children.slice(ind));
    });
  });
};

const after = (anchor: Gene, item: Gene): void => {
  anchor.parent.each((parent) => {
    const index = Locator.indexIn(parent, anchor);

    const detached = Detach.detach(Up.top(anchor), item) ?? (item);
    detached.parent = parent;
    index.each((ind) => {
      parent.children = parent.children.slice(0, ind + 1).concat([ detached ]).concat(parent.children.slice(ind + 1));
    });
  });
};

const append = (parent: Gene, item: Gene): void => {
  const detached = Detach.detach(Up.top(parent), item) ?? (item);
  parent.children = parent.children || [];
  parent.children = parent.children.concat([ detached ]);
  detached.parent = parent;
};

const appendAll = (parent: Gene, items: Gene[]): void => {
  (items).map((item) => {
    append(parent, item);
  });
};

const afterAll = (anchor: Gene, items: Gene[]): void => {
  anchor.parent.each((parent) => {
    const index = Locator.indexIn(parent, anchor);

    const detached = (items).map((item) => {
      const ditem = Detach.detach(Up.top(anchor), item) ?? (item);
      ditem.parent = parent;
      return ditem;
    });
    index.each((ind) => {
      parent.children = parent.children.slice(0, ind + 1).concat(detached).concat(parent.children.slice(ind + 1));
    });
  });
};

const prepend = (parent: Gene, item: Gene): void => {
  const detached = Detach.detach(Up.top(parent), item) ?? (item);
  parent.children = parent.children || [];
  parent.children = [ detached ].concat(parent.children);
  detached.parent = parent;
};

const wrap = (anchor: Gene, wrapper: Gene): void => {
  // INVESTIGATE: At this stage, mutation is necessary to act like the DOM
  anchor.parent.each((parent) => {
    wrapper.parent = parent;
    parent.children = (parent.children || []).map((c) => {
      return c === anchor ? wrapper : c;
    });
    wrapper.children = [ anchor ];
    anchor.parent = wrapper;
  });
};

export {
  before,
  after,
  afterAll,
  append,
  appendAll,
  prepend,
  wrap
};

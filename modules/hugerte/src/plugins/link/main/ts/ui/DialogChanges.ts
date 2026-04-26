

import { LinkDialogCatalog, LinkDialogData, LinkDialogUrlData, ListGroup, ListItem, ListValue } from './DialogTypes';

export interface DialogDelta {
  readonly url: LinkDialogUrlData;
  readonly text: string;
}

export interface DialogChanges {
  readonly onChange: (getData: () => LinkDialogData, change: { name: string }) => (Partial<LinkDialogData>) | null;
}

const isListGroup = (item: ListItem): item is ListGroup =>
  (item as Record<string)[any>, 'items'] != null;

const findTextByValue = (value: string, catalog: ListItem[]): (ListValue) | null =>
  ((catalog) as any[]).reduce<any>((acc: any, x: any) => acc !== null ? acc : ((item) => {
    if (isListGroup(item)) {
      return findTextByValue(value, item.items);
    } else {
      return (item.value === value ? item : null);
    }
  })(x), null);

const getDelta = (persistentText: string, fieldName: 'link' | 'anchor', catalog: ListItem[], data: Partial<LinkDialogData>): (DialogDelta) | null => {
  const value = data[fieldName];
  const hasPersistentText = persistentText.length > 0;
  return value !== undefined ? findTextByValue(value, catalog).map((i) => ({
    url: {
      value: i.value,
      meta: {
        text: hasPersistentText ? persistentText : i.text,
        attach: () => {}
      }
    },
    text: hasPersistentText ? persistentText : i.text
  })) : null;
};

const findCatalog = (catalogs: LinkDialogCatalog, fieldName: string): (ListItem[]) | null => {
  if (fieldName === 'link') {
    return catalogs.link;
  } else if (fieldName === 'anchor') {
    return catalogs.anchor;
  } else {
    return null;
  }
};

const init = (initialData: LinkDialogData, linkCatalog: LinkDialogCatalog): DialogChanges => {
  const persistentData = {
    text: initialData.text,
    title: initialData.title
  };

  const getTitleFromUrlChange = (url: LinkDialogUrlData): (string) | null =>
    (persistentData.title.length <= 0 ? (url.meta?.title ?? null) ?? ('') : null);

  const getTextFromUrlChange = (url: LinkDialogUrlData): (string) | null =>
    (persistentData.text.length <= 0 ? (url.meta?.text ?? null) ?? (url.value) : null);

  const onUrlChange = (data: LinkDialogData): (Partial<LinkDialogData>) | null => {
    const text = getTextFromUrlChange(data.url);
    const title = getTitleFromUrlChange(data.url);
    // We are going to change the text/title because it has not been manually entered by the user.
    if (text !== null || title !== null) {
      return {
        ...text.map((text) => ({ text })) ?? ({ }),
        ...title.map((title) => ({ title })) ?? ({ })
      };
    } else {
      return null;
    }
  };

  const onCatalogChange = (data: LinkDialogData, change: 'link' | 'anchor'): (Partial<LinkDialogData>) | null => {
    const catalog = findCatalog(linkCatalog, change) ?? ([ ]);
    return getDelta(persistentData.text, change, catalog, data);
  };

  const onChange = (getData: () => LinkDialogData, change: { name: string }): (Partial<LinkDialogData>) | null => {
    const name = change.name;
    if (name === 'url') {
      return onUrlChange(getData());
    } else if (([ 'anchor', 'link' ]).includes(name)) {
      return onCatalogChange(getData(), name as 'anchor' | 'link');
    } else if (name === 'text' || name === 'title') {
      // Update the persistent text/title state, as a user has input custom text
      persistentData[name] = getData()[name];
      return null;
    } else {
      return null;
    }
  };

  return {
    onChange
  };
};

export const DialogChanges = {
  init,
  getDelta
};

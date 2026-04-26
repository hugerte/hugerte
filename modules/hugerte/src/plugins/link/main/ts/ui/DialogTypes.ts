
import { Dialog } from 'hugerte/core/api/ui/Ui';

export type ListValue = Dialog.ListBoxSingleItemSpec;
export type ListGroup = Dialog.ListBoxNestedItemSpec;
export type ListItem = Dialog.ListBoxItemSpec;

export interface UserListItem {
  text?: string;
  title?: string;
  value?: string;
  url?: string;
  menu?: UserListItem[];
}

export interface LinkDialogCatalog {
  link: (ListItem[]) | null;
  targets: (ListItem[]) | null;
  rels: (ListItem[]) | null;
  classes: (ListItem[]) | null;
  anchor: (ListItem[]) | null;
}

export interface LinkDialogInfo {
  readonly anchor: {
    readonly url: (string) | null;
    readonly text: (string) | null;
    readonly target: (string) | null;
    readonly rel: (string) | null;
    readonly linkClass: (string) | null;
    readonly title: (string) | null;
  };
  readonly catalogs: LinkDialogCatalog;
  readonly flags: {
    readonly titleEnabled: boolean;
  };
  readonly optNode: (HTMLAnchorElement) | null;
  readonly onSubmit?: (api: Dialog.DialogInstanceApi<LinkDialogData>) => void;
}

export interface LinkDialogUrlData {
  readonly value: string;
  readonly meta?: LinkUrlMeta;
}

export type LinkDialogKey = 'text' | 'target' | 'rel' | 'linkClass' | 'title';

export interface LinkDialogData {
  readonly url: LinkDialogUrlData;
  readonly text: string;
  readonly title: string;
  readonly anchor: string;
  readonly link: string;
  readonly rel: string;
  readonly target: string;
  readonly linkClass: string;
}

export interface LinkDialogOutput {
  readonly href: string;
  readonly text: (string) | null;
  readonly target: (string) | null;
  readonly rel: (string) | null;
  readonly class: (string) | null;
  readonly title: (string) | null;
}

interface LinkUrlMeta {
  readonly text?: string;
  readonly title?: string;
  readonly attach?: () => void;
  readonly original?: {
    readonly value: string;
  };
}

export interface AttachState {
  readonly href: string;
  readonly attach: () => void;
}

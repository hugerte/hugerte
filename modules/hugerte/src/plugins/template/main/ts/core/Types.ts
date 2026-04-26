
export interface UrlTemplate {
  readonly title: string;
  readonly description: string;
  readonly url: string;
}

export interface ContentTemplate {
  readonly title: string;
  readonly description: string;
  readonly content: string;
}

export type ExternalTemplate = UrlTemplate | ContentTemplate;

export interface InternalTemplate {
  readonly selected: boolean;
  readonly text: string;
  readonly value: {
    readonly url: (string) | null;
    readonly content: (string) | null;
    readonly description: string;
  };
}

export interface DialogData {
  readonly template: string;
  readonly preview: string;
}

export type TemplateValues = Record<string, string | ((name: string) => string)>;

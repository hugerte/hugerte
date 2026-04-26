
export interface Gene {
  id: string;
  name: string;
  children: Gene[];
  css: Record<string, string>;
  attrs: Record<string, string>;
  text?: string;
  parent: (Gene) | null;
  random?: number;
}

export const Gene = (id: string, name: string, children: Gene[] = [], css: Record<string, string> = {}, attrs: Record<string, string> = {}, text?: string): Gene => {
  const parent = null;
  return {
    id,
    name,
    children,
    css,
    attrs,
    text,
    parent
  };
};

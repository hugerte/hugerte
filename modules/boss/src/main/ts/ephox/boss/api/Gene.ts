import { Optional } from '@ephox/katamari';

/** Basically like a VDOM record */
export interface Gene {
  id: string;
  name: string;
  children: Gene[];
  css: Record<string, string>;
  attrs: Record<string, string>;
  text?: string;
  parent: Optional<Gene>;
  random?: number;
}

/** Let me create a new Gene for you. We should actually use a modified version of VanJS here. TODO. */
export const Gene = (id: string, name: string, children: Gene[] = [], css: Record<string, string> = {}, attrs: Record<string, string> = {}, text?: string): Gene => {
  const parent = Optional.none<Gene>();
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

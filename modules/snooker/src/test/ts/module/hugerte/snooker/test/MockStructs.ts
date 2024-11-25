import { Arr } from "@hugerte/katamari";
import { SugarElement, SugarNode, TextContent } from "@hugerte/sugar";

import * as Structs from "hugerte/snooker/api/Structs";

// Creates an elementNew (or returns from elements array if it already exists)
const getElementNew = (elements: Structs.ElementNew[], tagName: 'td' | 'th' | 'col', text: string, isNew: boolean, isLocked: boolean): Structs.ElementNew => {
  const createAndAppendElement = () => {
    const elm = SugarElement.fromTag(tagName);
    TextContent.set(elm, text);
    return Structs.elementnew(elm, isNew, isLocked);
  };

  return Arr.find(elements,
    (elementNew) => SugarNode.name(elementNew.element) === tagName && TextContent.get(elementNew.element) === text
  ).getOrThunk(createAndAppendElement);
};

export {
  getElementNew
};

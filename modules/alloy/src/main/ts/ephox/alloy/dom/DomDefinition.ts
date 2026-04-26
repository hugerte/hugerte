import { SugarElement } from '@ephox/sugar';

export interface GeneralDefinitionSpec<EC> {
  uid: string;
  tag?: string;
  attributes?: Record<string, any>;
  classes?: string[];
  styles?: Record<string, string>;
  value?: any;
  innerHtml?: string;
  domChildren?: EC;
  // defChildren?: DC[];
}

export interface DomDefinitionSpec extends GeneralDefinitionSpec<SugarElement<Node>> {

}

export interface GeneralDefinitionDetail<EC> {
  uid: string;
  tag: string;
  attributes: Record<string, any>;
  classes: string[];
  styles: Record<string, string>;
  value: (any) | null;
  innerHtml: (string) | null;
  domChildren: EC[];
}

export interface DomDefinitionDetail extends GeneralDefinitionDetail<SugarElement<Node>> {

}

const defToStr = <EC>(defn: GeneralDefinitionDetail<EC>): string => {
  const raw = defToRaw(defn);
  return JSON.stringify(raw, null, 2);
};

const defToRaw = <EC>(defn: GeneralDefinitionDetail<EC>): GeneralDefinitionSpec<string> => ({
  uid: defn.uid,
  tag: defn.tag,
  classes: defn.classes,
  attributes: defn.attributes,
  styles: defn.styles,
  value: defn.value ?? ('<none>'),
  innerHtml: defn.innerHtml ?? ('<none>'),
  domChildren: defn.domChildren.length === 0 ? '0 children, but still specified' : String(defn.domChildren.length)
});

export {
  defToStr,
  defToRaw
};

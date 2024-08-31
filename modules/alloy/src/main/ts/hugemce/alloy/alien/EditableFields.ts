import { Attribute, SugarElement, SugarNode } from '@hugemce/sugar';

const inside = (target: SugarElement<Node>): boolean => (
  (SugarNode.isTag('input')(target) && Attribute.get(target, 'type') !== 'radio') ||
  SugarNode.isTag('textarea')(target)
);

export {
  inside
};

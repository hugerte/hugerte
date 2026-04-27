
import Editor from '../api/Editor';
import AstNode from '../api/html/Node';
import { AnnotationsRegistry, AnnotatorSettings } from './AnnotationsRegistry';
import * as Markings from './Markings';

const setup = (editor: Editor, registry: AnnotationsRegistry): void => {
  const dataAnnotation = Markings.dataAnnotation();
  const identifyParserNode = (node: AstNode): (AnnotatorSettings) | null => {
    const attrVal = node.attr(dataAnnotation);
    return attrVal != null ? registry.lookup(attrVal) : null;
  };

  const removeDirectAnnotation = (node: AstNode) => {
    node.attr(Markings.dataAnnotationId(), null);
    node.attr(Markings.dataAnnotation(), null);
    node.attr(Markings.dataAnnotationActive(), null);

    const attrNamesStr = node.attr(Markings.dataAnnotationAttributes());
    const customAttrNames = attrNamesStr != null ? attrNamesStr.split(',') : [];
    const classesStr = node.attr(Markings.dataAnnotationClasses());
    const customClasses = classesStr != null ? classesStr.split(',') : [];
    (customAttrNames).forEach((name) => node.attr(name, null));

    const classList = node.attr('class')?.split(' ') ?? [];
    const newClassList = (classList).filter((_x: any) => !([ Markings.annotation() ].concat(customClasses)).includes(_x));
    node.attr('class', newClassList.length > 0 ? newClassList.join(' ') : null);

    node.attr(Markings.dataAnnotationClasses(), null);
    node.attr(Markings.dataAnnotationAttributes(), null);
  };

  editor.serializer.addTempAttr(Markings.dataAnnotationActive());

  editor.serializer.addAttributeFilter(dataAnnotation, (nodes) => {
    for (const node of nodes) {
      const settings = identifyParserNode(node);
      if (settings !== null) {
        if (settings.persistent === false) {
          if (node.name === 'span') {
            node.unwrap();
          } else {
            removeDirectAnnotation(node);
          }
        }
      }
    }
  });
};

export {
  setup
};

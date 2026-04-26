
import Editor from '../api/Editor';
import AstNode from '../api/html/Node';
import { AnnotationsRegistry, AnnotatorSettings } from './AnnotationsRegistry';
import * as Markings from './Markings';

const setup = (editor: Editor, registry: AnnotationsRegistry): void => {
  const dataAnnotation = Markings.dataAnnotation();
  const identifyParserNode = (node: AstNode): (AnnotatorSettings) | null =>
    (node.attr(dataAnnotation) ?? null).bind(registry.lookup);

  const removeDirectAnnotation = (node: AstNode) => {
    node.attr(Markings.dataAnnotationId(), null);
    node.attr(Markings.dataAnnotation(), null);
    node.attr(Markings.dataAnnotationActive(), null);

    const customAttrNames = (node.attr(Markings.dataAnnotationAttributes()) ?? null).map((names) => names.split(',')) ?? ([]);
    const customClasses = (node.attr(Markings.dataAnnotationClasses()) ?? null).map((names) => names.split(',')) ?? ([]);
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
      identifyParserNode(node).each((settings) => {
        if (settings.persistent === false) {
          if (node.name === 'span') {
            node.unwrap();
          } else {
            removeDirectAnnotation(node);
          }
        }
      });
    }
  });
};

export {
  setup
};

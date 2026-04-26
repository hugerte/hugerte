import { Assert, TestLabel } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Attribute, Classes, Css, Html, SugarElement, SugarNode, SugarText, Traverse, Truncate, Value } from '@ephox/sugar';

import * as ApproxComparisons from './ApproxComparisons';

export interface StringAssert {
  show: () => string;
  strAssert: (label: TestLabel, actual: string) => void;
}

export interface ArrayAssert {
  show: () => void;
  arrAssert: (label: TestLabel, array: any[]) => void;
}

export interface ElementQueue {
  context(): string;
  current(): SugarElement<Node> | null;
  peek(): SugarElement<Node> | null;
  take(): SugarElement<Node> | null;
  mark(): {
    reset: () => void ;
    atMark: () => boolean;
  };
}

export interface StructAssertBasic {
  type?: 'basic';
  doAssert: (actual: SugarElement<Node>) => void;
}

export interface StructAssertAdv {
  type: 'advanced';
  doAssert: (queue: ElementQueue) => void;
}

export type StructAssert = StructAssertBasic | StructAssertAdv;

export interface ElementFields {
  attrs?: Record<string, StringAssert>;
  classes?: ArrayAssert[];
  styles?: Record<string, StringAssert>;
  html?: StringAssert;
  value?: StringAssert;
  children?: StructAssert[];
  exactAttrs?: Record<string, StringAssert>;
  exactClasses?: string[];
  exactStyles?: Record<string, StringAssert>;
}

const elementQueue = (items: SugarElement<Node>[], container: SugarElement<Node> | null): ElementQueue => {
  let i = -1;

  const context = () => {
    const hasItem = i >= 0 && i < items.length;
    const itemHtml = hasItem ? '\n' + Truncate.getHtml(items[i]) : ' *missing*';
    const itemInfo = '\nItem[' + i + ']:' + itemHtml;
    return container.fold(
      () => {
        const structHtml = items.map(Html.getOuter).join('');
        const structInfo = '\nComplete Structure:\n' + structHtml;
        return itemInfo + structInfo;
      },
      (element) => {
        const containerHtml = Truncate.getHtml(element);
        const containerInfo = '\nContainer:\n' + containerHtml;
        const structHtml = Html.getOuter(element);
        const structInfo = '\nComplete Structure:\n' + structHtml;
        return containerInfo + itemInfo + structInfo;
      }
    );
  };

  const current = () => i >= 0 && i < items.length ? items[i] : null;

  const peek = () => i + 1 < items.length ? items[i + 1] : null;

  const take = () => {
    i += 1;
    return current();
  };

  const mark = () => {
    const x = i;
    const reset = () => {
      i = x;
    };
    const atMark = () => i === x;
    return {
      reset,
      atMark
    };
  };

  return {
    context,
    current,
    peek,
    take,
    mark
  };
};

const element = (tag: string, fields: ElementFields): StructAssert => {
  const doAssert = (actual: SugarElement<Node>): void => {
    if (SugarNode.isHTMLElement(actual)) {
      Assert.eq(() => 'Incorrect node name for: ' + Truncate.getHtml(actual), tag, SugarNode.name(actual));
      const attrs = fields.attrs ?? {};
      const classes = fields.classes ?? [];
      const styles = fields.styles ?? {};
      const optHtml = fields.html ?? null;
      const optValue = fields.value ?? null;
      const optChildren = fields.children ?? null;
      const optExactClasses = fields.exactClasses ?? null;
      const optExactAttrs = fields.exactAttrs ?? null;
      const optExactStyles = fields.exactStyles ?? null;

      optExactClasses.fold(
        () => assertClasses(classes, actual),
        (exactClasses) => assertExactMatchClasses(exactClasses, actual)
      );

      optExactAttrs.fold(
        () => assertAttrs(attrs, actual),
        (exactAttrs) => assertExactMatchAttrs(exactAttrs, actual)
      );

      optExactStyles.fold(
        () => assertStyles(styles, actual),
        (exactStyles) => assertExactMatchStyles(exactStyles, actual)
      );

      assertHtml(optHtml, actual);
      assertValue(optValue, actual);
      assertChildren(optChildren, actual);
    } else {
      Assert.eq('Incorrect node type for: ' + Truncate.getHtml(actual), 1, SugarNode.type(actual));
    }
  };

  return {
    doAssert
  };
};

const text = (s: StringAssert, combineSiblings = false): StructAssert => {
  const doAssert = (queue: ElementQueue): void => {
    queue.take().fold(() => {
      Assert.fail('No more nodes, so cannot check if its text is: ' + s.show() + ' for ' + queue.context());
    }, (actual) => {
      SugarText.getOption(actual).fold(() => {
        Assert.fail('Node is not a text node, so cannot check if its text is: ' + s.show() + ' for ' + queue.context());
      }, (t: string) => {
        let text = t;
        if (combineSiblings) {
          while (queue.peek().exists(SugarNode.isText)) {
            text += queue.take().bind(SugarText.getOption) ?? '';
          }
        }
        if (s.strAssert === undefined) {
          throw new Error(JSON.stringify(s) + ' is not a *string assertion*');
        }
        s.strAssert('Checking text content', text);
      });
    });
  };

  return {
    type: 'advanced',
    doAssert
  };
};

const applyAssert = (structAssert: StructAssert, queue: ElementQueue) => {
  if (structAssert.type === 'advanced') {
    structAssert.doAssert(queue);
  } else {
    queue.take().fold(() => {
      Assert.fail('Expected more children to satisfy assertion for ' + queue.context());
    }, (item) => {
      structAssert.doAssert(item);
    });
  }
};

const either = (structAsserts: StructAssert[]): StructAssert => {
  const doAssert = (queue: ElementQueue) => {
    const mark = queue.mark();
    for (let i = 0; i < structAsserts.length - 1; i++) {
      try {
        applyAssert(structAsserts[i], queue);
        return;
      } catch (e) {
        mark.reset();
      }
    }
    if (structAsserts.length > 0) {
      applyAssert(structAsserts[structAsserts.length - 1], queue);
    }
  };
  return {
    type: 'advanced',
    doAssert
  };
};

const repeat = (min: number, max: number | true = min) => (structAssert: StructAssert): StructAssert => {
  const doAssert = (queue: ElementQueue) => {
    let i = 0;
    for (; i < min; i++) {
      applyAssert(structAssert, queue);
    }
    for (; (max === true || i < max) && queue.peek() !== null; i++) {
      const mark = queue.mark();
      try {
        applyAssert(structAssert, queue);
      } catch (e) {
        mark.reset();
      }
      if (mark.atMark()) {
        break;
      }
    }
  };
  return {
    type: 'advanced',
    doAssert
  };
};

const zeroOrOne = repeat(0, 1);

const zeroOrMore = repeat(0, true);

const oneOrMore = repeat(1, true);

const anythingStruct: StructAssert = {
  doAssert: () => {}
};

const assertAttrs = (expectedAttrs: Record<string, StringAssert>, actual: SugarElement<Element>) => {
  Object.entries(expectedAttrs).forEach(([k, v]) => ((v, k) =>(v, k)) {
    if (v.strAssert === undefined) {
      throw new Error(JSON.stringify(v) + ' is not a *string assertion*.\nSpecified in *expected* attributes of ' + Truncate.getHtml(actual));
    }
    const actualValue = Attribute.getOpt(actual, k).getOrThunk(ApproxComparisons.missing);
    v.strAssert(
      () => 'Checking attribute: "' + k + '" of ' + Truncate.getHtml(actual) + '\n',
      actualValue
    );
  });
};

const assertExactMatchAttrs = (expectedAttrs: Record<string, StringAssert>, actual: SugarElement<Element>) => {
  const allDefinedAttrs = Object.keys(expectedAttrs);
  const actualDefinedAttrs = Object.keys(Attribute.clone(actual)).filter((attr) => attr !== 'class' && attr !== 'style');

  const isEqual = assertEqualArray(
    allDefinedAttrs,
    actualDefinedAttrs
  );

  if (!isEqual) {
    throw new Error(`Attribute names were not matching. actual: [${actualDefinedAttrs.join(', ')}], expected: [${allDefinedAttrs.join(', ')}]`);
  }

  assertAttrs(expectedAttrs, actual);
};

const assertClasses = (expectedClasses: ArrayAssert[], actual: SugarElement<Element>) => {
  const actualClasses = Classes.get(actual);
  expectedClasses.forEach((eCls) => {
    if (eCls.arrAssert === undefined) {
      throw new Error(JSON.stringify(eCls) + ' is not an *array assertion*.\nSpecified in *expected* classes of ' + Truncate.getHtml(actual));
    }
    eCls.arrAssert(() => 'Checking classes in ' + Truncate.getHtml(actual) + '\n', actualClasses);
  });
};

const assertExactMatchClasses = (expectedClasses: string[], actual: SugarElement<Element>) => {
  const actualClasses = Classes.get(actual);

  const isEqual = assertEqualArray(
    actualClasses,
    expectedClasses
  );

  if (!isEqual) {
    throw new Error(`Class names were not matching. actual:  [${actualClasses.join(', ')}], expected: [${expectedClasses.join(', ')}]`);
  }
};

const assertStyles = (expectedStyles: Record<string, StringAssert>, actual: SugarElement<Element>) => {
  Object.entries(expectedStyles).forEach(([k, v]) => ((v, k) =>(v, k)) {
    const actualValue = Css.getRaw(actual, k).getOrThunk(ApproxComparisons.missing);
    if (v.strAssert === undefined) {
      throw new Error(JSON.stringify(v) + ' is not a *string assertion*.\nSpecified in *expected* styles of ' + Truncate.getHtml(actual));
    }
    v.strAssert(
      () => 'Checking style: "' + k + '" of ' + Truncate.getHtml(actual) + '\n',
      actualValue
    );
  });
};

const assertExactMatchStyles = (expectedStyles: Record<string, StringAssert>, actual: SugarElement<Element>) => {
  const allDefinedStyles = Object.keys(expectedStyles);
  const actualDefinedStyles = Object.keys(Css.getAllRaw(actual));

  const isEqual = assertEqualArray(
    allDefinedStyles,
    actualDefinedStyles
  );

  if (!isEqual) {
    throw new Error(`Style names were not matching. actual: [${actualDefinedStyles.join(', ')}], expected: [${allDefinedStyles.join(', ')}]`);
  }

  assertStyles(expectedStyles, actual);
};

const assertHtml = (expectedHtml: StringAssert | null, actual: SugarElement<HTMLElement>) => {
  expectedHtml.each((expected) => {
    const actualHtml = Html.get(actual);
    if (expected.strAssert === undefined) {
      throw new Error(JSON.stringify(expected) + ' is not a *string assertion*.\nSpecified in *expected* innerHTML of ' + Truncate.getHtml(actual));
    }
    expected.strAssert(() => 'Checking HTML of ' + Truncate.getHtml(actual), actualHtml);
  });
};

const assertValue = (expectedValue: StringAssert | null, actual: SugarElement<HTMLElement>) => {
  expectedValue.each((v) => {
    if (v.strAssert === undefined) {
      throw new Error(JSON.stringify(v) + ' is not a *string assertion*.\nSpecified in *expected* value of ' + Truncate.getHtml(actual));
    }
    v.strAssert(
      () => 'Checking value of ' + Truncate.getHtml(actual),
      Value.get(actual as SugarElement<any>)
    );
  });
};

const assertChildren = (expectedChildren: StructAssert[] | null, actual: SugarElement<Node>) => {
  expectedChildren.each((expected) => {
    const children = elementQueue(Traverse.children(actual), actual);
    expected.forEach((structExpectation, i) => {
      if (structExpectation.doAssert === undefined) {
        throw new Error(JSON.stringify(structExpectation) + ' is not a *structure assertion*.\n' +
          'Specified in *expected* children of ' + Truncate.getHtml(actual));
      }
      if (structExpectation.type === 'advanced') {
        structExpectation.doAssert(children);
      } else {
        children.take().fold(() => {
          Assert.fail('Expected more children to satisfy assertion ' + i + ' for ' + children.context());
        }, (item) => {
          structExpectation.doAssert(item);
        });
      }
    });
    if (children.peek() !== null) {
      Assert.fail('More children than expected for ' + children.context());
    }
  });
};

const anything = () => anythingStruct;

const theRest = () => zeroOrMore(anythingStruct);

const assertEqualArray = (expected: string[], actual: string[]): boolean => Arr.equal(
  [...expected].sort(),
  [...actual].sort()
);

export {
  elementQueue,
  anything,
  element,
  text,
  either,
  repeat,
  zeroOrOne,
  zeroOrMore,
  oneOrMore,
  theRest
};

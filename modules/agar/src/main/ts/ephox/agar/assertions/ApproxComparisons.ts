// @ts-nocheck
import { Assert, TestLabel } from '@ephox/bedrock-client';


import { ArrayAssert, StringAssert } from './ApproxStructures';

const missingValuePlaceholder: string = '_' + Math.random().toString(36).slice(2);

const dieWith = (message: string): () => never => () => { throw new Error(message); };

const assertOnBool = (c: boolean, label: TestLabel, value: any): void => {
  const strValue = value === missingValuePlaceholder ? '{missing}' : value;
  Assert.eq(
    TestLabel.concat(label, () => ', Actual value: ' + JSON.stringify(strValue)),
    true,
    c
  );
};

export type CombinedAssert = StringAssert & ArrayAssert;

const is = (target: string): CombinedAssert => {
  const compare = (actual: string) => target === actual;

  const strAssert = (label: TestLabel, actual: string) => {
    const c = compare(actual);
    assertOnBool(c, TestLabel.concat(label, '\nExpected value: ' + JSON.stringify(target)), actual);
  };

  return {
    show: () => 'is("' + target + '")',
    strAssert,
    arrAssert: dieWith('"is" is not an array assertion. Perhaps you wanted "has"?')
  };
};

const startsWith = (target: string): CombinedAssert => {
  const compare = (actual: string) => actual.startsWith(target);

  const strAssert = (label: TestLabel, actual: string) => {
    const c = compare(actual);
    assertOnBool(c, TestLabel.concat(label, '\nExpected value: ' + 'startsWith(' + target + ')'), actual);
  };

  return {
    show: () => 'startsWith("' + target + '")',
    strAssert,
    arrAssert: dieWith('"startsWith" is not an array assertion. Perhaps you wanted "hasPrefix"?')
  };
};

const contains = (target: string): CombinedAssert => {
  const compare = (actual: string) => actual.includes(target);

  const strAssert = (label: TestLabel, actual: string) => {
    const c = compare(actual);
    assertOnBool(c, TestLabel.concat(label, '\nExpected value: ' + 'contains(' + target + ')'), actual);
  };

  return {
    show: () => 'contains("' + target + '")',
    strAssert,
    arrAssert: dieWith('"contains" is not an array assertion. Perhaps you wanted "has"?')
  };
};

const measurement = (amount: number, unit: string, margin: number): CombinedAssert => {
  const strAssert = (label: TestLabel, actual: string) => {
    const optValue = parseFloat(actual);
    return optValue.fold(
      () => {
        // There is no valid number, so fail.
        throw new Error(`"${actual}" was not a valid measurement`);
      },
      (value) => {
        const actualUnit = actual.startsWith(`${value}`) ? actual.slice((`${value}`).length) : actual;
        if (actualUnit !== unit) {
          throw new Error(`"${actual}" did not have the correct unit. Expected: "${unit}", but was: "${actualUnit}"`);
        } else {
          // Compare the value, with an error margin.
          if (Math.abs(amount - value) > margin) {
            throw new Error(`"${actual}" was not within "${margin}${unit}" of the expected value: "${amount}${unit}"`);
          }
        }
      }
    );
  };

  return {
    show: () => `measurement("${amount} +/- ${margin}", ${unit}`,
    strAssert,
    arrAssert: dieWith('"measurement" is not an array assertion')
  };
};

const none = (message: string = '[[missing value]]'): CombinedAssert => {
  const compare = (actual: string) => actual === missingValuePlaceholder;

  const strAssert = (label: TestLabel, actual) => {
    const c = compare(actual);
    assertOnBool(c, TestLabel.concat(label, '\nExpected ' + message), actual);
  };

  return {
    show: () => 'none("' + message + '")',
    strAssert,
    arrAssert: dieWith('"none" is not an array assertion. Perhaps you wanted "not"?')
  };
};

const has = <T>(target: T): CombinedAssert => {
  const compare = (t: T) => t === target;

  const arrAssert = (label: TestLabel, array: T[]) => {
    const matching = array.some(compare);
    assertOnBool(matching, TestLabel.concat(label, 'Expected array to contain: ' + target), array);
  };

  return {
    show: () => 'has("' + target + '")',
    strAssert: dieWith('"has" is not a string assertion. Perhaps you wanted "is"?'),
    arrAssert
  };
};

const hasPrefix = (prefix: string): CombinedAssert => {
  const compare = (t: string) => t.startsWith(prefix);

  const arrAssert = (label: TestLabel, array: string[]) => {
    const matching = array.some(compare);
    assertOnBool(matching, TestLabel.concat(label, 'Expected array to contain something with prefix: ' + prefix), array);
  };

  return {
    show: () => 'hasPrefix("' + prefix + '")',
    strAssert: dieWith('"hasPrefix" is not a string assertion. Perhaps you wanted "startsWith"?'),
    arrAssert
  };
};

const not = <T>(target: T): CombinedAssert => {
  const compare = (actual: T) => target !== actual;

  const arrAssert = (label: TestLabel, array: T[]) => {
    // For not, all have to pass the comparison
    const matching = array.every(compare);
    assertOnBool(matching, TestLabel.concat(label, 'Expected array to not contain: ' + target), array);
  };

  return {
    show: () => 'not("' + target + '")',
    strAssert: dieWith('"not" is not a string assertion. Perhaps you wanted "none"?'),
    arrAssert
  };
};

const missing: () => string = () => missingValuePlaceholder;

export {
  is,
  startsWith,
  contains,
  none,
  measurement,

  has,
  hasPrefix,
  not,

  missing
};

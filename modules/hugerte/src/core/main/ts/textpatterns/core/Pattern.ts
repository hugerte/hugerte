import { Result, Results } from '@ephox/katamari';

import { BlockPattern, DynamicPatternContext, DynamicPatternsLookup, InlineCmdPattern, InlinePattern, Pattern, PatternError, PatternSet, RawDynamicPatternsLookup, RawPattern, BlockPatternTrigger } from './PatternTypes';

const isInlinePattern = (pattern: Pattern): pattern is InlinePattern =>
  pattern.type === 'inline-command' || pattern.type === 'inline-format';

const isBlockPattern = (pattern: Pattern): pattern is BlockPattern =>
  pattern.type === 'block-command' || pattern.type === 'block-format';

const hasBlockTrigger = (pattern: Pattern, trigger: BlockPatternTrigger): boolean =>
  (pattern.type === 'block-command' || pattern.type === 'block-format') && pattern.trigger === trigger;

const normalizePattern = (pattern: RawPattern): Result<Pattern, PatternError> => {
  const err = (message: string) => Result.error({ message, pattern });
  const formatOrCmd = <T> (name: string, onFormat: (formats: string[]) => T, onCommand: (cmd: string, value: any) => T): Result<T, PatternError> => {
    if (pattern.format !== undefined) {
      let formats: string[];
      if (Array.isArray(pattern.format)) {
        if (!(pattern.format).every((x: any): x is string => typeof x === 'string')) {
          return err(name + ' pattern has non-string items in the `format` array');
        }
        formats = pattern.format as string[];
      } else if (typeof (pattern.format) === 'string') {
        formats = [ pattern.format ];
      } else {
        return err(name + ' pattern has non-string `format` parameter');
      }
      return Result.value(onFormat(formats));
    } else if (pattern.cmd !== undefined) {
      if (!typeof (pattern.cmd) === 'string') {
        return err(name + ' pattern has non-string `cmd` parameter');
      }
      return Result.value(onCommand(pattern.cmd, pattern.value));
    } else {
      return err(name + ' pattern is missing both `format` and `cmd` parameters');
    }
  };
  if (!(typeof (pattern) === 'object' && (pattern) !== null)) {
    return err('Raw pattern is not an object');
  }
  if (!typeof (pattern.start) === 'string') {
    return err('Raw pattern is missing `start` parameter');
  }
  if (pattern.end !== undefined) {
    // inline pattern
    if (!typeof (pattern.end) === 'string') {
      return err('Inline pattern has non-string `end` parameter');
    }
    if (pattern.start.length === 0 && pattern.end.length === 0) {
      return err('Inline pattern has empty `start` and `end` parameters');
    }
    let start = pattern.start;
    let end = pattern.end;
    // when the end is empty swap with start as it is more efficient
    if (end.length === 0) {
      end = start;
      start = '';
    }
    return formatOrCmd<InlinePattern>('Inline',
      (format) => ({ type: 'inline-format', start, end, format }),
      (cmd, value) => ({ type: 'inline-command', start, end, cmd, value }));
  } else if (pattern.replacement !== undefined) {
    // replacement pattern
    if (!typeof (pattern.replacement) === 'string') {
      return err('Replacement pattern has non-string `replacement` parameter');
    }
    if (pattern.start.length === 0) {
      return err('Replacement pattern has empty `start` parameter');
    }
    return Result.value<InlineCmdPattern>({
      type: 'inline-command',
      start: '',
      end: pattern.start,
      cmd: 'mceInsertContent',
      value: pattern.replacement
    });
  } else {
    // block pattern
    const trigger = pattern.trigger ?? 'space';

    if (pattern.start.length === 0) {
      return err('Block pattern has empty `start` parameter');
    }
    return formatOrCmd<BlockPattern>('Block', (formats) => ({
      type: 'block-format',
      start: pattern.start,
      format: formats[0],
      trigger
    }), (command, commandValue) => ({
      type: 'block-command',
      start: pattern.start,
      cmd: command,
      value: commandValue,
      trigger
    }));
  }
};

const getBlockPatterns = (patterns: Pattern[]): BlockPattern[] =>
  (patterns).filter(isBlockPattern);

const getInlinePatterns = (patterns: Pattern[]): InlinePattern[] =>
  (patterns).filter(isInlinePattern);

const createPatternSet = (patterns: Pattern[], dynamicPatternsLookup: DynamicPatternsLookup): PatternSet => ({
  inlinePatterns: getInlinePatterns(patterns),
  blockPatterns: getBlockPatterns(patterns),
  dynamicPatternsLookup
});

const filterByTrigger = (patterns: PatternSet, trigger: BlockPatternTrigger): PatternSet => {
  return {
    ...patterns,
    blockPatterns: (patterns.blockPatterns).filter((pattern) => hasBlockTrigger(pattern, trigger))
  };
};

const fromRawPatterns = (patterns: RawPattern[]): Pattern[] => {
  const normalized = Results.partition((patterns).map(normalizePattern));
  // eslint-disable-next-line no-console
  (normalized.errors).forEach((err) => console.error(err.message, err.pattern));
  return normalized.values;
};

const fromRawPatternsLookup = (lookupFn: RawDynamicPatternsLookup): DynamicPatternsLookup => {
  return (ctx: DynamicPatternContext) => {
    const rawPatterns = lookupFn(ctx);
    return fromRawPatterns(rawPatterns);
  };
};

export {
  normalizePattern,
  createPatternSet,
  getBlockPatterns,
  getInlinePatterns,
  fromRawPatterns,
  fromRawPatternsLookup,
  filterByTrigger
};

import DomParser, { DomParserSettings } from 'hugerte/core/api/html/DomParser';
import Schema from 'hugerte/core/api/html/Schema';

export const Parser = (schema?: Schema, settings: DomParserSettings = {}): DomParser => DomParser({
  forced_root_block: false,
  validate: false,
  allow_conditional_comments: true,
  ...settings
}, schema);

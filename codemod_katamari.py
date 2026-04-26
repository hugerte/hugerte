#!/usr/bin/env python3
"""
Comprehensive codemod script to:
1. Fix pre-existing corruption from previous codemods
2. Replace remaining @ephox/katamari imports with native JS/TS equivalents
"""
import os
import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).parent

# Modules to REPLACE (remove from katamari imports)
REPLACE_MODULES = {'Fun', 'Type', 'Arr', 'Obj', 'Merger', 'Optionals', 'Optional',
                   'Strings', 'Unicode', 'Num', 'Throttler'}
# Modules to KEEP in katamari imports
KEEP_MODULES = {'Cell', 'Singleton', 'Adt', 'Result', 'Future', 'FutureResult',
                'KAssert', 'OptionalInstances', 'ResultInstances', 'Thunk',
                'LazyValue', 'Regex', 'Namespace', 'Unique', 'Resolve', 'Id',
                'Contracts', 'Results'}


def extract_args(text, start_idx):
    """Extract comma-separated top-level args from text starting at start_idx (after opening paren)."""
    depth = 1
    i = start_idx
    current_arg = []
    args = []
    in_string = False
    string_char = ''
    escape_next = False

    while i < len(text) and depth > 0:
        c = text[i]

        if escape_next:
            current_arg.append(c)
            escape_next = False
            i += 1
            continue

        if c == '\\' and in_string:
            escape_next = True
            current_arg.append(c)
            i += 1
            continue

        if in_string:
            current_arg.append(c)
            if c == string_char:
                # Check for template literal closing
                if string_char == '`' or c == string_char:
                    in_string = False
                    string_char = ''
            i += 1
            continue

        if c in ('"', "'", '`'):
            in_string = True
            string_char = c
            current_arg.append(c)
            i += 1
            continue

        if c in '([{':
            depth += 1
            current_arg.append(c)
        elif c in ')]}':
            depth -= 1
            if depth > 0:
                current_arg.append(c)
            else:
                args.append(''.join(current_arg).strip())
        elif c == ',' and depth == 1:
            args.append(''.join(current_arg).strip())
            current_arg = []
        else:
            current_arg.append(c)
        i += 1

    return args, i


def find_call_start(text, idx, func_name):
    """Find the opening paren of func_name( starting from idx."""
    # idx points to the char after func_name
    # Skip whitespace
    while idx < len(text) and text[idx] in ' \t\n':
        idx += 1
    if idx < len(text) and text[idx] == '(':
        return idx
    return -1


def replace_two_arg_call(text, module_name, method_name, replacement_template):
    """Replace Module.method(arr, fn) with arr.replacement(fn) style calls."""
    pattern = re.compile(r'\b' + re.escape(module_name) + r'\.' + re.escape(method_name) + r'\s*\(')

    result = []
    last_end = 0
    for m in pattern.finditer(text):
        result.append(text[last_end:m.start()])
        call_start = m.end()  # position after '('
        args, call_end = extract_args(text, call_start)
        if len(args) >= 2:
            arr = args[0]
            fn = args[1]
            remaining = ', '.join(args[2:])
            repl = replacement_template.format(arr=arr, fn=fn, remaining=remaining)
            result.append(repl)
        else:
            # Can't replace safely, keep original
            result.append(m.group(0))
            call_end = m.end()
        last_end = call_end

    result.append(text[last_end:])
    return ''.join(result)


def replace_three_arg_call(text, module_name, method_name, replacement_template):
    """Replace Module.method(a, b, c) with template."""
    pattern = re.compile(r'\b' + re.escape(module_name) + r'\.' + re.escape(method_name) + r'\s*\(')

    result = []
    last_end = 0
    for m in pattern.finditer(text):
        result.append(text[last_end:m.start()])
        call_start = m.end()
        args, call_end = extract_args(text, call_start)
        if len(args) >= 3:
            a, b, c = args[0], args[1], args[2]
            repl = replacement_template.format(a=a, b=b, c=c)
            result.append(repl)
        elif len(args) >= 2:
            a, b = args[0], args[1]
            repl = replacement_template.format(a=a, b=b, c='')
            result.append(repl)
        else:
            result.append(m.group(0))
            call_end = m.end()
        last_end = call_end

    result.append(text[last_end:])
    return ''.join(result)


def replace_one_arg_call(text, module_name, method_name, replacement_template):
    """Replace Module.method(x) with template."""
    pattern = re.compile(r'\b' + re.escape(module_name) + r'\.' + re.escape(method_name) + r'\s*\(')

    result = []
    last_end = 0
    for m in pattern.finditer(text):
        result.append(text[last_end:m.start()])
        call_start = m.end()
        args, call_end = extract_args(text, call_start)
        if len(args) >= 1:
            x = args[0]
            repl = replacement_template.format(x=x)
            result.append(repl)
        else:
            result.append(m.group(0))
            call_end = m.end()
        last_end = call_end

    result.append(text[last_end:])
    return ''.join(result)


def apply_fun_replacements(text):
    """Replace Fun module usages."""
    # Fun.constant(x) → () => x  (but need to wrap objects in parens)
    # We'll do this with extract_args
    pattern = re.compile(r'\bFun\.constant\s*\(')
    result = []
    last_end = 0
    for m in pattern.finditer(text):
        result.append(text[last_end:m.start()])
        call_start = m.end()
        args, call_end = extract_args(text, call_start)
        if len(args) >= 1:
            x = args[0].strip()
            # If x starts with { it's an object literal, wrap in parens
            if x.startswith('{'):
                repl = f'() => ({x})'
            else:
                repl = f'() => {x}'
            result.append(repl)
        else:
            result.append(m.group(0))
            call_end = m.end()
        last_end = call_end
    result.append(text[last_end:])
    text = ''.join(result)

    # Fun.die(msg) → () => { throw new Error(msg); }
    pattern = re.compile(r'\bFun\.die\s*\(')
    result = []
    last_end = 0
    for m in pattern.finditer(text):
        result.append(text[last_end:m.start()])
        call_start = m.end()
        args, call_end = extract_args(text, call_start)
        if len(args) >= 1:
            msg = args[0]
            result.append(f'() => {{ throw new Error({msg}); }}')
        else:
            result.append(m.group(0))
            call_end = m.end()
        last_end = call_end
    result.append(text[last_end:])
    text = ''.join(result)

    # Simple property replacements
    text = re.sub(r'\bFun\.identity\b', '(x: any) => x', text)
    text = re.sub(r'\bFun\.noop\b', '() => {}', text)
    text = re.sub(r'\bFun\.never\b', '() => false', text)
    text = re.sub(r'\bFun\.always\b', '() => true', text)
    text = re.sub(r'\bFun\.tripleEquals\b', '(a: any, b: any) => a === b', text)

    # Fun.curry and Fun.compose - skip (complex, leave for manual fix)
    return text


def apply_type_replacements(text):
    """Replace Type module usages."""
    text = replace_one_arg_call(text, 'Type', 'isString', "typeof ({x}) === 'string'")
    text = replace_one_arg_call(text, 'Type', 'isNumber', "typeof ({x}) === 'number'")
    text = replace_one_arg_call(text, 'Type', 'isBoolean', "typeof ({x}) === 'boolean'")
    text = replace_one_arg_call(text, 'Type', 'isFunction', "typeof ({x}) === 'function'")
    text = replace_one_arg_call(text, 'Type', 'isArray', 'Array.isArray({x})')
    text = replace_one_arg_call(text, 'Type', 'isNull', '({x}) === null')
    text = replace_one_arg_call(text, 'Type', 'isUndefined', '({x}) === undefined')
    text = replace_one_arg_call(text, 'Type', 'isNullable', '({x}) == null')
    text = replace_one_arg_call(text, 'Type', 'isNonNullable', '({x}) != null')
    text = replace_one_arg_call(text, 'Type', 'isObject', "(typeof ({x}) === 'object' && ({x}) !== null)")
    return text


def apply_arr_replacements(text):
    """Replace Arr module usages."""
    # 2-arg methods
    text = replace_two_arg_call(text, 'Arr', 'map', '({arr}).map({fn})')
    text = replace_two_arg_call(text, 'Arr', 'each', '({arr}).forEach({fn})')
    text = replace_two_arg_call(text, 'Arr', 'filter', '({arr}).filter({fn})')
    text = replace_two_arg_call(text, 'Arr', 'find', '(({arr}).find({fn}) ?? null)')
    text = replace_two_arg_call(text, 'Arr', 'findIndex', '({arr}).findIndex({fn})')
    text = replace_two_arg_call(text, 'Arr', 'exists', '({arr}).some({fn})')
    text = replace_two_arg_call(text, 'Arr', 'forall', '({arr}).every({fn})')
    text = replace_two_arg_call(text, 'Arr', 'bind', '({arr}).flatMap({fn})')
    text = replace_two_arg_call(text, 'Arr', 'contains', '({arr}).includes({fn})')
    text = replace_two_arg_call(text, 'Arr', 'difference', '({arr}).filter((x: any) => !({fn}).includes(x))')
    text = replace_two_arg_call(text, 'Arr', 'get', '(({arr})[{fn}] ?? null)')
    text = replace_two_arg_call(text, 'Arr', 'range', 'Array.from({{ length: {arr} }}, (_, i) => ({fn})(i))')

    # 3-arg methods: foldl, foldr
    text = replace_three_arg_call(text, 'Arr', 'foldl', '({a}).reduce({b}, {c})')
    text = replace_three_arg_call(text, 'Arr', 'foldr', '({a}).reduceRight((acc: any, v: any) => ({b})(v, acc), {c})')

    # 1-arg methods
    text = replace_one_arg_call(text, 'Arr', 'flatten', '({x}).flat()')
    text = replace_one_arg_call(text, 'Arr', 'head', '(({x})[0] ?? null)')
    text = replace_one_arg_call(text, 'Arr', 'last', '(({x})[({x}).length - 1] ?? null)')
    text = replace_one_arg_call(text, 'Arr', 'unique', '[...new Set({x})]')
    text = replace_one_arg_call(text, 'Arr', 'reverse', '[...({x})].reverse()')

    # findMap - uses Optional style, skip for now (complex)
    # sort - needs custom sort function
    text = replace_two_arg_call(text, 'Arr', 'sort', '([...({arr})].sort({fn}))')

    # groupBy - complex, skip
    # chunk - complex, skip

    return text


def apply_obj_replacements(text):
    """Replace Obj module usages. Note: Obj callbacks use (value, key) order!"""
    text = replace_two_arg_call(text, 'Obj', 'has', 'Object.prototype.hasOwnProperty.call({arr}, {fn})')
    text = replace_one_arg_call(text, 'Obj', 'keys', 'Object.keys({x})')
    text = replace_one_arg_call(text, 'Obj', 'values', 'Object.values({x})')
    text = replace_one_arg_call(text, 'Obj', 'size', 'Object.keys({x}).length')

    text = replace_two_arg_call(
        text, 'Obj', 'map',
        'Object.fromEntries(Object.entries({arr}).map(([k, v]) => [k, ({fn})(v, k)]))'
    )
    text = replace_two_arg_call(
        text, 'Obj', 'each',
        'Object.entries({arr}).forEach(([k, v]) => ({fn})(v, k))'
    )
    text = replace_two_arg_call(
        text, 'Obj', 'filter',
        'Object.fromEntries(Object.entries({arr}).filter(([k, v]) => ({fn})(v, k)))'
    )
    text = replace_two_arg_call(
        text, 'Obj', 'find',
        '(Object.entries({arr}).find(([k, v]) => ({fn})(v, k))?.[1] ?? null)'
    )
    text = replace_two_arg_call(
        text, 'Obj', 'mapToArray',
        'Object.entries({arr}).map(([k, v]) => ({fn})(v, k))'
    )
    text = replace_one_arg_call(text, 'Obj', 'fromPairs', 'Object.fromEntries({x})')
    text = replace_two_arg_call(text, 'Obj', 'get', '(({arr})[{fn}] ?? null)')
    return text


def apply_merger_replacements(text):
    """Replace Merger module usages."""
    text = replace_two_arg_call(text, 'Merger', 'merge', '{{ ...({arr}), ...({fn}) }}')
    text = replace_two_arg_call(text, 'Merger', 'deepMerge', '{{ ...({arr}), ...({fn}) }}')
    return text


def apply_strings_replacements(text):
    """Replace Strings module usages."""
    text = replace_two_arg_call(text, 'Strings', 'startsWith', '({arr}).startsWith({fn})')
    text = replace_two_arg_call(text, 'Strings', 'endsWith', '({arr}).endsWith({fn})')
    text = replace_two_arg_call(text, 'Strings', 'contains', '({arr}).includes({fn})')
    text = replace_one_arg_call(text, 'Strings', 'trim', '({x}).trim()')
    text = replace_two_arg_call(
        text, 'Strings', 'removeLeading',
        '(({arr}).startsWith({fn}) ? ({arr}).slice(({fn}).length) : ({arr}))'
    )
    text = replace_one_arg_call(text, 'Strings', 'isEmpty', '({x}).length === 0')
    text = replace_one_arg_call(text, 'Strings', 'toFloat', 'parseFloat({x})')
    return text


def apply_unicode_replacements(text):
    """Replace Unicode module usages."""
    text = re.sub(r'\bUnicode\.zeroWidth\b', r"'\\u200b'", text)
    text = re.sub(r'\bUnicode\.nbsp\b', r"'\\u00a0'", text)
    text = re.sub(r'\bUnicode\.zwsp\b', r"'\\u200b'", text)
    text = re.sub(r'\bUnicode\.linefeed\b', r"'\\n'", text)
    text = re.sub(r'\bUnicode\.softHyphen\b', r"'\\u00ad'", text)
    return text


def apply_num_replacements(text):
    """Replace Num module usages."""
    text = replace_three_arg_call(text, 'Num', 'clamp', 'Math.min(Math.max({a}, {b}), {c})')
    return text


def apply_optionals_replacements(text):
    """Replace Optionals module usages."""
    # Optionals.cat(arr) → arr.filter((x): x is NonNullable<typeof x> => x != null)
    text = replace_one_arg_call(
        text, 'Optionals', 'cat',
        '({x}).filter((x): x is NonNullable<typeof x> => x != null)'
    )
    # lift2(oa, ob, fn)
    text = replace_three_arg_call(
        text, 'Optionals', 'lift2',
        '(({a}) != null && ({b}) != null ? ({c})(({a}), ({b})) : null)'
    )
    # lift3(oa, ob, oc, fn) - 4 args
    pattern = re.compile(r'\bOptionals\.lift3\s*\(')
    result = []
    last_end = 0
    for m in pattern.finditer(text):
        result.append(text[last_end:m.start()])
        args, call_end = extract_args(text, m.end())
        if len(args) >= 4:
            oa, ob, oc, fn = args[0], args[1], args[2], args[3]
            result.append(f'(({oa}) != null && ({ob}) != null && ({oc}) != null ? ({fn})(({oa}), ({ob}), ({oc})) : null)')
        else:
            result.append(m.group(0))
            call_end = m.end()
        last_end = call_end
    result.append(text[last_end:])
    text = ''.join(result)

    # bindFrom(opt, fn) → (opt != null ? fn(opt) : null)
    text = replace_two_arg_call(
        text, 'Optionals', 'bindFrom',
        '(({arr}) != null ? ({fn})(({arr})) : null)'
    )
    # mapFrom(a, fn)
    text = replace_two_arg_call(
        text, 'Optionals', 'mapFrom',
        '(({arr}) != null ? ({fn})(({arr})) : null)'
    )
    # someIf(b, a)
    text = replace_two_arg_call(
        text, 'Optionals', 'someIf',
        '(({arr}) ? ({fn}) : null)'
    )
    return text


def apply_optional_static_replacements(text):
    """Replace Optional.from(), Optional.some(), Optional.none() calls."""
    # Optional.none() → null
    text = re.sub(r'\bOptional\.none\s*\(\s*\)', 'null', text)
    # Also handle: Optional.none<T>()
    text = re.sub(r'\bOptional\.none\s*<[^>]*>\s*\(\s*\)', 'null', text)
    # Optional.some(x) → x  (be careful: only if it's a simple wrapping)
    text = replace_one_arg_call(text, 'Optional', 'some', '{x}')
    # Optional.from(x) → (x ?? null)
    text = replace_one_arg_call(text, 'Optional', 'from', '({x} ?? null)')
    return text


def find_throttler_files():
    """Find files that use Throttler."""
    result = subprocess.run(
        ['grep', '-r', r'\bThrottler\b', '--include=*.ts', '-l'],
        capture_output=True, text=True, cwd=str(REPO_ROOT)
    )
    files = [f for f in result.stdout.strip().split('\n')
             if f and 'node_modules' not in f and 'katamari/src' not in f]
    return files


def get_throttler_local_path(ts_file):
    """Determine where to create a local Throttler.ts for a given file."""
    ts_path = Path(ts_file)
    # Find the src/main/ts directory
    parts = ts_path.parts
    for i, part in enumerate(parts):
        if part in ('main', 'core') and i + 1 < len(parts) and parts[i + 1] == 'ts':
            base = Path(*parts[:i + 2])
            return base / 'api' / 'Throttler.ts', base / 'api'
    # Fallback: same directory
    return ts_path.parent / 'Throttler.ts', ts_path.parent


THROTTLER_CONTENT = '''export interface Throttler<A extends any[]> {
  readonly cancel: () => void;
  readonly throttle: (...args: A) => void;
}

export const adaptable = <A extends any[]>(fn: (...a: A) => void, rate: number): Throttler<A> => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let args: A | null = null;
  const cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
      args = null;
    }
  };
  const throttle = (...newArgs: A) => {
    args = newArgs;
    if (timer === null) {
      timer = setTimeout(() => {
        const tempArgs = args;
        timer = null;
        args = null;
        fn.apply(null, tempArgs as A);
      }, rate);
    }
  };
  return { cancel, throttle };
};

export const first = <A extends any[]>(fn: (...a: A) => void, rate: number): Throttler<A> => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
  const throttle = (...args: A) => {
    if (timer === null) {
      timer = setTimeout(() => {
        timer = null;
        fn.apply(null, args);
      }, rate);
    }
  };
  return { cancel, throttle };
};

export const last = <A extends any[]>(fn: (...a: A) => void, rate: number): Throttler<A> => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };
  const throttle = (...args: A) => {
    cancel();
    timer = setTimeout(() => {
      timer = null;
      fn.apply(null, args);
    }, rate);
  };
  return { cancel, throttle };
};
'''


def parse_katamari_import(line):
    """Parse `import { A, B, C } from '@ephox/katamari';` and return set of names."""
    m = re.match(r"import\s*\{([^}]+)\}\s*from\s*'@ephox/katamari'\s*;?", line.strip())
    if m:
        names = {n.strip() for n in m.group(1).split(',') if n.strip()}
        return names
    return None


def update_import_line(line, modules_to_remove):
    """Update a katamari import line by removing specified modules."""
    names = parse_katamari_import(line)
    if names is None:
        return line

    remaining = names - modules_to_remove
    if not remaining:
        return None  # Remove the import entirely

    # Preserve formatting by rebuilding
    sorted_remaining = sorted(remaining)
    return f"import {{ {', '.join(sorted_remaining)} }} from '@ephox/katamari';"


def get_modules_in_file(text):
    """Get all katamari modules imported in the file."""
    modules = set()
    for line in text.split('\n'):
        if "from '@ephox/katamari'" in line:
            names = parse_katamari_import(line)
            if names:
                modules.update(names)
    return modules


def fix_corruption_patterns(text):
    """Fix known corruption patterns from previous codemods."""
    # Pattern 1: Extra ) at end of file (from Arr.each → forEach conversion)
    # e.g., `});)` at end → `});`
    text = re.sub(r'\}\s*\);\s*\)\s*$', '});\n', text, flags=re.MULTILINE)
    text = re.sub(r'\}\s*\);\s*\)\s*\n\s*$', '});\n', text)

    # Pattern 2: `() = {` → `() => {` (broken arrow function)
    # Be careful not to match `= {` which is an assignment
    text = re.sub(r'\(\s*\)\s*=\s*\{', '() => {', text)
    # Also: `(x: Type) = {` → `(x: Type) => {`
    # More general: match `(...params...) = {` where params don't contain `=` (to avoid assignments)
    # This is risky so be conservative - only match when preceded by `)` and followed by ` {`
    # Only fix `=> ()` pattern breaking: `() => () = {}` → `() => () => {}`
    text = re.sub(r'\(\)\s*=\s*\{\s*\}', '() => {}', text)

    # Pattern 3: Trailing `)` on last line like `});)`
    lines = text.split('\n')
    if lines:
        last_line = lines[-1]
        if last_line.strip() == ')':
            # Check if there's a `});` two lines above
            if len(lines) >= 2 and lines[-2].strip() == '});':
                lines.pop(-1)
                text = '\n'.join(lines)

    return text


def process_file(filepath):
    """Process a single TypeScript file, applying all replacements."""
    with open(filepath, 'r', encoding='utf-8') as f:
        original = f.read()

    text = original
    modules_in_file = get_modules_in_file(text)
    modules_to_replace_here = modules_in_file & REPLACE_MODULES
    modules_to_remove_from_import = set()

    if not modules_to_replace_here:
        return False  # Nothing to do

    # Apply fixes for pre-existing corruption
    text = fix_corruption_patterns(text)

    # Apply replacements based on which modules are imported
    if 'Fun' in modules_to_replace_here:
        text = apply_fun_replacements(text)
        modules_to_remove_from_import.add('Fun')

    if 'Type' in modules_to_replace_here:
        text = apply_type_replacements(text)
        modules_to_remove_from_import.add('Type')

    if 'Arr' in modules_to_replace_here:
        text = apply_arr_replacements(text)
        modules_to_remove_from_import.add('Arr')

    if 'Obj' in modules_to_replace_here:
        text = apply_obj_replacements(text)
        modules_to_remove_from_import.add('Obj')

    if 'Merger' in modules_to_replace_here:
        text = apply_merger_replacements(text)
        modules_to_remove_from_import.add('Merger')

    if 'Strings' in modules_to_replace_here:
        text = apply_strings_replacements(text)
        modules_to_remove_from_import.add('Strings')

    if 'Unicode' in modules_to_replace_here:
        text = apply_unicode_replacements(text)
        modules_to_remove_from_import.add('Unicode')

    if 'Num' in modules_to_replace_here:
        text = apply_num_replacements(text)
        modules_to_remove_from_import.add('Num')

    if 'Optionals' in modules_to_replace_here:
        text = apply_optionals_replacements(text)
        modules_to_remove_from_import.add('Optionals')

    if 'Optional' in modules_to_replace_here:
        text = apply_optional_static_replacements(text)
        modules_to_remove_from_import.add('Optional')

    # Update import lines
    new_lines = []
    for line in text.split('\n'):
        if "from '@ephox/katamari'" in line and modules_to_remove_from_import:
            updated = update_import_line(line, modules_to_remove_from_import)
            if updated is not None:
                new_lines.append(updated)
            # else: remove the line entirely
        else:
            new_lines.append(line)

    text = '\n'.join(new_lines)

    if text != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(text)
        return True

    return False


def handle_throttler(files):
    """Create Throttler.ts files and update imports."""
    # Group files by their module root
    throttler_locations = {}

    for filepath in files:
        ts_path = Path(filepath)
        # Find the nearest 'src/main/ts' directory
        parts = ts_path.parts
        target_dir = None
        for i in range(len(parts) - 1, 0, -1):
            if parts[i] == 'ts' and i > 0 and parts[i-1] == 'main':
                # Found src/main/ts, create util/Throttler.ts here
                target_dir = Path(*parts[:i+1]) / 'api'
                break

        if target_dir is None:
            target_dir = ts_path.parent

        throttler_ts = target_dir / 'Throttler.ts'
        throttler_locations[str(ts_path)] = throttler_ts

    # Create unique throttler files
    created = set()
    for ts_file, throttler_path in throttler_locations.items():
        if str(throttler_path) not in created:
            if not throttler_path.exists():
                throttler_path.parent.mkdir(parents=True, exist_ok=True)
                with open(throttler_path, 'w') as f:
                    f.write(THROTTLER_CONTENT)
                print(f'  Created: {throttler_path}')
                created.add(str(throttler_path))

    # Update imports in consuming files
    for ts_file, throttler_path in throttler_locations.items():
        with open(ts_file, 'r', encoding='utf-8') as f:
            content = f.read()

        if 'Throttler' not in content:
            continue

        # Check if it imports Throttler from katamari
        if "from '@ephox/katamari'" not in content:
            continue

        # Calculate relative import path
        ts_path = Path(ts_file)
        try:
            rel = os.path.relpath(throttler_path.with_suffix(''), ts_path.parent)
            if not rel.startswith('.'):
                rel = './' + rel
            # Convert backslashes to forward slashes (Windows)
            rel = rel.replace('\\', '/')
        except ValueError:
            continue

        new_content = content

        # Update the katamari import to remove Throttler
        lines = new_content.split('\n')
        new_lines = []
        for line in lines:
            if "from '@ephox/katamari'" in line and 'Throttler' in line:
                updated = update_import_line(line, {'Throttler'})
                if updated is not None:
                    new_lines.append(updated)
                # else: remove the import entirely
            else:
                new_lines.append(line)

        # Add Throttler import if not already present
        new_content = '\n'.join(new_lines)
        if f"from '{rel}'" not in new_content and 'Throttler' in new_content:
            # Find the last import line and insert after it
            import_lines = [i for i, l in enumerate(new_content.split('\n'))
                          if l.startswith('import ')]
            if import_lines:
                lines2 = new_content.split('\n')
                last_import = import_lines[-1]
                lines2.insert(last_import + 1, f"import * as Throttler from '{rel}';")
                new_content = '\n'.join(lines2)

        if new_content != content:
            with open(ts_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'  Updated Throttler import in: {ts_file}')


def find_target_files():
    """Find all .ts files outside node_modules that import modules to replace."""
    result = subprocess.run(
        ['grep', '-r', "--include=*.ts", '-l', "from '@ephox/katamari'"],
        capture_output=True, text=True, cwd=str(REPO_ROOT)
    )
    all_files = [f for f in result.stdout.strip().split('\n')
                 if f and 'node_modules' not in f]

    # Filter to files that actually use modules we need to replace
    target_files = []
    for filepath in all_files:
        full_path = REPO_ROOT / filepath
        try:
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
            modules = get_modules_in_file(content)
            if modules & REPLACE_MODULES:
                target_files.append(str(full_path))
        except Exception:
            pass

    return target_files


def main():
    print('Finding target files...')
    target_files = find_target_files()
    print(f'Found {len(target_files)} files to process')

    changed = 0
    for filepath in target_files:
        try:
            if process_file(filepath):
                changed += 1
                print(f'  Modified: {filepath}')
        except Exception as e:
            print(f'  ERROR processing {filepath}: {e}')
            import traceback
            traceback.print_exc()

    print(f'\nModified {changed} files')

    # Handle Throttler separately
    print('\nHandling Throttler...')
    throttler_files = find_throttler_files()
    print(f'Found {len(throttler_files)} files using Throttler')
    if throttler_files:
        handle_throttler(throttler_files)


if __name__ == '__main__':
    main()

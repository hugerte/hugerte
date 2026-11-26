const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const source = readFileSync(path.join(__dirname, '../Gruntfile.js'), 'utf8');
const projects = [
  { name: '@ephox/katamari', location: '/modules/katamari' },
  { name: 'hugerte', location: '/modules/hugerte' }
];

const failure = (status, stdout = '', stderr = 'lerna ERR! discovery failed') =>
  Object.assign(new Error('Command failed'), { status, stdout: Buffer.from(stdout), stderr: Buffer.from(stderr) });

// Exercise the real Gruntfile without installing Grunt, Lerna, or editor dependencies.
const configure = (responses, options = {}) => {
  const calls = [];
  const tasks = {};
  const logs = [];
  let config;
  const module = { exports: {} };
  vm.runInNewContext(source, {
    module,
    require: (name) => {
      if (name === 'load-grunt-tasks') return () => {};
      assert.equal(name, 'child_process');
      return { execSync: (command, execOptions) => {
        calls.push({ command, options: execOptions });
        assert.ok(responses.length > 0, 'Unexpected discovery command');
        const response = responses.shift();
        if (response instanceof Error) throw response;
        // Model shell redirection: warnings contaminate stdout only with 2>&1.
        const output = typeof response === 'string' ? response :
          response.stdout + (command.includes('2>&1') ? response.stderr : '');
        return Buffer.from(output);
      } };
    }
  }, { filename: 'Gruntfile.js' });
  module.exports({
    option: (name) => options[name],
    log: { writeln: (...args) => logs.push(args), warn: () => {} },
    initConfig: (value) => { config = value; },
    registerTask: (name, task) => { tasks[name] = task; }
  });
  return { config, tasks, calls, logs };
};

const assertTestsConfigured = ({ config, tasks }) => {
  assert.ok(config['bedrock-auto'].headless);
  assert.ok(config['bedrock-auto'].browser);
  assert.ok(Array.isArray(tasks['headless-auto']));
  assert.ok(Array.isArray(tasks['browser-auto']));
};

test('real changed failure with exit 1 aborts instead of falling back', () => {
  const error = failure(1);
  assert.throws(() => configure([error, JSON.stringify(projects)]), (actual) => actual === error);
});

test('list failure with exit 1 aborts instead of registering successful no-test tasks', () => {
  const error = failure(1);
  assert.throws(() => configure(['[]', error]), (actual) => actual === error);
});

test('other exit statuses and signals propagate', () => {
  for (const error of [failure(2), Object.assign(failure(null), { signal: 'SIGTERM' })]) {
    assert.throws(() => configure([error]), (actual) => actual === error);
  }
});

test('malformed changed and list JSON aborts', () => {
  assert.throws(() => configure(['not json']), { name: 'SyntaxError' });
  assert.throws(() => configure(['[]', 'not json']), { name: 'SyntaxError' });
});

test('Lerna 8 no-changes exit falls back to all projects', () => {
  const noChanges = failure(1, '', 'lerna notice cli v8.2.0\nlerna info No changed packages found\n');
  const result = configure([noChanges, JSON.stringify(projects)]);
  assertTestsConfigured(result);
  assert.equal(result.calls.length, 2);
  assert.match(result.calls[0].command, /--loglevel info/);
  assert.equal(result.calls[0].options.stdio, 'pipe');
  assert.ok(result.calls.every(({ command }) => !command.includes('2>&1')));
});

test('list failure after genuine no changes still aborts', () => {
  const noChanges = failure(1, '', 'lerna info No changed packages found\r\n');
  const error = failure(1);
  assert.throws(() => configure([noChanges, error]), (actual) => actual === error);
});

test('empty exit-1 output is not assumed to mean no changes', () => {
  const error = failure(1, '', '');
  assert.throws(() => configure([error, JSON.stringify(projects)]), (actual) => actual === error);
});

test('no-changes text cannot hide unexpected stdout, other statuses, or errors', () => {
  for (const error of [
    failure(1, 'not json', 'lerna info No changed packages found\n'),
    failure(2, '', 'lerna info No changed packages found\n'),
    failure(1, '', 'lerna info No changed packages found\nlerna ERR! unexpected failure\n')
  ]) {
    assert.throws(() => configure([error, JSON.stringify(projects)]), (actual) => actual === error);
  }
});

test('list exit-1 cannot be treated as no changes even with the diagnostic', () => {
  const error = failure(1, '', 'lerna info No changed packages found\n');
  assert.throws(() => configure(['[]', error]), (actual) => actual === error);
});

test('successful changed JSON selects projects without calling list', () => {
  const result = configure([JSON.stringify(projects)]);
  assertTestsConfigured(result);
  assert.equal(result.calls.length, 1);
});

test('successful empty changes falls back to all projects', () => {
  const result = configure(['[]', JSON.stringify(projects)]);
  assertTestsConfigured(result);
  assert.equal(result.calls.length, 2);
  assert.match(result.calls[1].command, /lerna list /);
});

test('ignore-lerna-changed lists all projects and still propagates list failures', () => {
  const result = configure([JSON.stringify(projects)], { 'ignore-lerna-changed': true });
  assertTestsConfigured(result);
  assert.equal(result.calls.length, 1);
  assert.match(result.calls[0].command, /lerna list /);
  const error = failure(1);
  assert.throws(() => configure([error], { 'ignore-lerna-changed': true }), (actual) => actual === error);
});

test('the actual Katamari assertions package is included in headless tests', () => {
  const { name } = JSON.parse(readFileSync(path.join(__dirname, '../modules/katamari-assertions/package.json'), 'utf8'));
  const location = '/modules/katamari-assertions';
  const result = configure([JSON.stringify([{ name, location }])]);
  assert.ok(result.config['bedrock-auto'].headless);
  assert.equal(result.config['bedrock-auto'].browser, undefined);
  assert.ok(result.config['bedrock-auto'].headless.testfiles.includes(`${location}/src/test/ts/atomic/**/*Test.ts`));
  assert.ok(Array.isArray(result.tasks['headless-auto']));
});

test('stderr warnings do not contaminate successful changed or list JSON', () => {
  const output = { stdout: JSON.stringify(projects), stderr: 'lerna WARN deprecated option\n' };
  assertTestsConfigured(configure([output]));
  assertTestsConfigured(configure(['[]', output]));
});

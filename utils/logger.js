/*
  Centralized logger to control verbosity across the project.
  - Configure via environment variables:
    - LOG_LEVEL: debug | info | warn | error | silent
    - DEBUG: truthy values (1/true/yes/on) force debug level in non-production
    - NODE_ENV: defaults to 'warn' in production, 'info' otherwise (unless DEBUG)
*/

const levelOrder = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 50,
};

function truthyEnv(val) {
  return ['1', 'true', 'yes', 'on'].includes(String(val || '').toLowerCase());
}

const isProd = process.env.NODE_ENV === 'production';
const debugForced = truthyEnv(process.env.DEBUG);

const defaultLevel = isProd ? 'warn' : (debugForced ? 'debug' : 'info');
const configuredLevel = String(process.env.LOG_LEVEL || defaultLevel).toLowerCase();
const currentLevel = levelOrder[configuredLevel] ?? levelOrder.info;

function formatArgs(level, args) {
  const ts = new Date().toISOString();
  return [`[${ts}] [${level.toUpperCase()}]`, ...args];
}

const noop = () => {};

const logger = {
  level: configuredLevel,
  setLevel(newLevel) {
    if (levelOrder[newLevel] == null) return;
    this.level = newLevel;
  },
  debug: currentLevel <= levelOrder.debug ? (...args) => console.log(...formatArgs('debug', args)) : noop,
  info: currentLevel <= levelOrder.info ? (...args) => console.log(...formatArgs('info', args)) : noop,
  warn: currentLevel <= levelOrder.warn ? (...args) => console.warn(...formatArgs('warn', args)) : noop,
  error: currentLevel <= levelOrder.error ? (...args) => console.error(...formatArgs('error', args)) : noop,
};

module.exports = { logger };

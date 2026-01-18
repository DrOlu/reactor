import path from 'path';
import { homedir } from 'os';

import { getDataDir, getResourceDir } from './paths';

export const REACTOR_TITLE = 'Reactor';
export const REACTOR_WEBSITE = 'https://github.com/DrOlu/reactor';
export const REACTOR_DATA_DIR = getDataDir();
export const REACTOR_CACHE_DIR = path.join(REACTOR_DATA_DIR, 'cache');
export const RESOURCES_DIR = getResourceDir();
export const LOGS_DIR = path.join(REACTOR_DATA_DIR, 'logs');
export const DB_FILE_PATH = path.join(REACTOR_DATA_DIR, 'reactor.db');
export const SETUP_COMPLETE_FILENAME = path.join(REACTOR_DATA_DIR, 'setup-complete');
export const PYTHON_VENV_DIR = path.join(REACTOR_DATA_DIR, 'python-venv');
export const PYTHON_COMMAND = process.platform === 'win32' ? path.join(PYTHON_VENV_DIR, 'Scripts', 'python.exe') : path.join(PYTHON_VENV_DIR, 'bin', 'python');
export const REACTOR_CONNECTOR_DIR = path.join(REACTOR_DATA_DIR, 'reactor-connector');
export const REACTOR_MCP_SERVER_DIR = path.join(REACTOR_DATA_DIR, 'mcp-server');
export const UV_EXECUTABLE =
  process.platform === 'win32'
    ? path.join(RESOURCES_DIR, 'win', 'uv.exe')
    : process.platform === 'darwin'
      ? path.join(RESOURCES_DIR, 'macos', 'uv')
      : path.join(RESOURCES_DIR, 'linux', 'uv');
export const SERVER_PORT = process.env.REACTOR_PORT ? parseInt(process.env.REACTOR_PORT) : 24337;
export const PID_FILES_DIR = path.join(REACTOR_DATA_DIR, 'reactor-processes');
// constants for project directory files
export const REACTOR_DIR = '.reactor';
export const REACTOR_TASKS_DIR = path.join(REACTOR_DIR, 'tasks');
export const REACTOR_TODOS_FILE = 'todos.json';
export const REACTOR_RULES_DIR = 'rules';
export const REACTOR_PROJECT_RULES_DIR = path.join(REACTOR_DIR, REACTOR_RULES_DIR);
export const REACTOR_GLOBAL_RULES_DIR = path.join(homedir(), REACTOR_DIR, REACTOR_RULES_DIR);
export const REACTOR_COMMANDS_DIR = path.join(REACTOR_DIR, 'commands');
export const REACTOR_HOOKS_DIR = path.join(REACTOR_DIR, 'hooks');
export const REACTOR_GLOBAL_HOOKS_DIR = path.join(homedir(), REACTOR_DIR, 'hooks');
export const REACTOR_PROMPTS_DIR = path.join(REACTOR_DIR, 'prompts');
export const REACTOR_DEFAULT_PROMPTS_DIR = path.join(RESOURCES_DIR, 'prompts');
export const REACTOR_GLOBAL_PROMPTS_DIR = path.join(homedir(), REACTOR_DIR, 'prompts');
export const REACTOR_AGENTS_DIR = path.join(REACTOR_DIR, 'agents');
export const REACTOR_TMP_DIR = path.join(REACTOR_DIR, 'tmp');
export const REACTOR_WATCH_FILES_LOCK = path.join(REACTOR_DIR, 'watch-files.lock');
export const WORKTREE_BRANCH_PREFIX = 'reactor/task/';
export const REACTOR_MEMORY_FILE = path.join(REACTOR_DATA_DIR, 'memory.db');

export const POSTHOG_PUBLIC_API_KEY = 'phc_AF4zkjrcziXLh8PBFsRSvVr4VZ38p3ezsdX0KDYuElI';
export const POSTHOG_HOST = 'https://eu.i.posthog.com';

export const HEADLESS_MODE = process.env.REACTOR_HEADLESS === 'true';
export const AUTH_USERNAME = process.env.REACTOR_USERNAME;
export const AUTH_PASSWORD = process.env.REACTOR_PASSWORD;

export const PROBE_BINARY_PATH = path.join(
  RESOURCES_DIR,
  process.platform === 'win32' ? 'win' : process.platform === 'darwin' ? 'macos' : 'linux',
  process.platform === 'win32' ? 'probe.exe' : 'probe',
);

export const CLOUDFLARED_BINARY_PATH = path.join(
  RESOURCES_DIR,
  'app.asar.unpacked',
  'node_modules',
  'cloudflared',
  'bin',
  process.platform === 'win32' ? 'cloudflared.exe' : 'cloudflared',
);

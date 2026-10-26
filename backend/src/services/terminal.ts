
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import os from 'os';

const execFileAsync = promisify(execFile);
const TIMEOUT_MS = 15000;
const MAX_BUFFER = 1024 * 1024;

/**
 * Strict allowlist — the agent can ONLY run these commands.
 * Each command has its own argument validator. Anything else is rejected.
 */
type Validator = (args: string[]) => boolean;

const SAFE_TOKEN = /^[a-zA-Z0-9_.\-/@:=]+$/;
const SAFE_PKG = /^[a-zA-Z0-9_\-]+$/;
const SAFE_MODULE = /^[a-zA-Z0-9_]+$/;

const VALIDATORS: Record<string, Validator> = {
  'ls': (a) => a.every(x => SAFE_TOKEN.test(x) || /^-[a-zA-Z]+$/.test(x)),
  'pwd': (a) => a.length === 0,
  'whoami': (a) => a.length === 0,
  'echo': (a) => a.every(x => /^[\w\s.,!?:-]+$/.test(x)),
  'cat': (a) => a.length === 1 && SAFE_TOKEN.test(a[0]),
  'mkdir': (a) => a.length === 1 && SAFE_TOKEN.test(a[0]),
  'touch': (a) => a.length === 1 && SAFE_TOKEN.test(a[0]),
  'python': (a) =>
    a.length === 0 ||
    a[0] === '--version' ||
    (a[0] === '-m' && a.length === 2 && SAFE_MODULE.test(a[1])),
  'python3': (a) =>
    a.length === 0 ||
    a[0] === '--version' ||
    (a[0] === '-m' && a.length === 2 && SAFE_MODULE.test(a[1])),
  'pip': (a) =>
    (a[0] === 'list' && a.length === 1) ||
    (a[0] === 'install' && a.length >= 2 && a.slice(1).every(x => SAFE_PKG.test(x))),
  'pip3': (a) =>
    (a[0] === 'list' && a.length === 1) ||
    (a[0] === 'install' && a.length >= 2 && a.slice(1).every(x => SAFE_PKG.test(x))),
  'node': (a) => a.length === 0 || a[0] === '--version',
  'npm': (a) => a[0] === '--version' || a[0] === 'list',
  'git': (a) => (a[0] === 'status' || a[0] === 'log') && a.length === 1,
};

export interface TerminalResult {
  stdout: string;
  stderr: string;
  command: string;
  args: string[];
}

export function listAllowedCommands(): string[] {
  return Object.keys(VALIDATORS).sort();
}

export async function runSafeCommand(command: string, args: string[]): Promise<TerminalResult> {
  if (!VALIDATORS[command]) {
    throw Object.assign(new Error(`Command "${command}" is not allowed`), { status: 403 });
  }
  if (!VALIDATORS[command](args)) {
    throw Object.assign(new Error(`Invalid arguments for "${command}"`), { status: 400 });
  }

  const cwd = path.join(os.homedir(), 'epic-sandbox');
  const fs = await import('fs');
  if (!fs.existsSync(cwd)) fs.mkdirSync(cwd, { recursive: true });

  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      timeout: TIMEOUT_MS,
      maxBuffer: MAX_BUFFER,
      cwd,
      shell: false,
    });
    return { stdout: String(stdout).slice(0, 100_000), stderr: String(stderr).slice(0, 10_000), command, args };
  } catch (err: any) {
    return {
      stdout: String(err.stdout || '').slice(0, 100_000),
      stderr: String(err.stderr || err.message || '').slice(0, 10_000),
      command,
      args,
    };
  }
}
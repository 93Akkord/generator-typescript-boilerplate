import { promisify } from 'util';
import * as child_process from 'child_process';

const _exec = promisify(child_process.exec);
const _spawn = child_process.spawn;

let defaultSpawnOptions: child_process.SpawnOptions = {
    shell: true,
    stdio: 'inherit',
    cwd: undefined,
    env: process.env,
};

interface IDefaultExecOptions extends child_process.ExecOptions {
    encoding?: 'buffer' | 'utf8' | null;
}

let defaultExecOptions: IDefaultExecOptions = {
    encoding: 'utf8',
    cwd: null,
    env: process.env,
};

function removeTrailingNewLineChar(str: string): string {
    str = str.replace(/\r/g, '');

    if (str.substring(str.length - 1) === '\n') {
        str = str.substring(0, str.length - 1);
    }

    return str;
}

/**
 *
 * @param {string} command
 * @param {IDefaultExecOptions} options
 * @return {Promise<string>}
 */
export async function exec(command: string, options: IDefaultExecOptions = {}): Promise<string> {
    let lines = [];
    let { stdout, stderr } = await _exec(command, Object.assign(defaultExecOptions, options));

    [stderr, stdout].forEach((str) => {
        if (str != '') {
            lines.push(removeTrailingNewLineChar(str));
        }
    });

    return lines.join('\n');
}

/**
 *
 * @param {string} command
 * @param {child_process.SpawnOptions} options
 * @param {boolean} defaultHandling
 * @param {(code: number, signal: string) => void=} callback
 * @return {child_process.ChildProcess} ChildProcess
 */
export function spawn(command: string, options: child_process.SpawnOptions = {}, defaultHandling: boolean = true, callback?: (code: number, signal: string) => void): child_process.ChildProcess {
    let proc = _spawn(command, [], Object.assign(defaultSpawnOptions, options));

    if (defaultHandling) {
        ['stdout', 'stderr'].forEach((event) => {
            if (proc[event]) {
                proc[event].on('data', (chunk) => {
                    process[event].write(chunk);
                });
            }
        });
    }

    proc.on('exit', (code, signal) => {
        if (callback) {
            callback(code, signal);
        }
    });

    return proc;
}

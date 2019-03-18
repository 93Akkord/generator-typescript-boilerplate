/// <reference types="node" />
// @ts-check

const { promisify } = require('util');
const child_process = require('child_process');
const _exec = promisify(child_process.exec);
const _spawn = child_process.spawn;

/**
 * @type {child_process.SpawnOptions}
 */
let defaultSpawnOptions = {
    shell: true,
    stdio: 'inherit',
    cwd: undefined,
    env: process.env,
};

/**
 * @typedef {{ encoding?: "buffer" | "utf8" | null } & child_process.ExecOptions} IDefaultExecOptions
 * @type {IDefaultExecOptions}
 */
let defaultExecOptions = {
    encoding: 'utf8',
    cwd: null,
    env: process.env,
};

function removeTrailingNewLineChar(str) {
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
async function exec(command, options = {}) {
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
function spawn(command, options = {}, defaultHandling = true, callback) {
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

module.exports = {
    exec,
    spawn,
};

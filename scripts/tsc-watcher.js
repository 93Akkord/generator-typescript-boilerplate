/// <reference types="node" />
// @ts-check

const TscWatchClient = require('tsc-watch/client');
const { exec, spawn } = require('./command-line-helpers');

/**
 *
 * @param {string} scriptName
 * @param {string} [scriptRunner='npm']
 * @param {(code: number, signal: string) => void=} callback
 */
function runScript(scriptName, scriptRunner = 'npm', callback) {
    spawn(`${scriptRunner} run ${scriptName}`);
}

async function getTsc() {
    let res = await exec('where tsc');

    return res.split('\n')[0].replace(/\\/g, '/');
}

async function init() {
    let watch = new TscWatchClient();

    ['first_success', 'subsequent_success'].forEach(function(eventType, index, array) {
        watch.on(eventType, async function() {
            runScript('relink');
        });
    });

    watch.on('compile_errors', function() {
        // console.log('error:', arguments);
    });

    watch.start('--compiler', await getTsc());
}

(async function() {
    await init();
})();

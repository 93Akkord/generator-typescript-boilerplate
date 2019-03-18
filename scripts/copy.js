const ncp = require('ncp').ncp;
const path = require('path');

ncp.limit = 16;

let defaultOptions = {
    filter: '*',
    transform: (read, write) => {
        read.pipe(write);
    },
    clobber: true,
    dereference: false,
    stopOnErr: false,
    errs: null,
};

function ncpAsync(source, destination, options = defaultOptions) {
    return new Promise(function(resolve, reject) {
        ncp(source, destination, options, function(err) {
            if (err) {
                if (typeof err == 'string') {
                    err = new Error(err);
                }

                reject(err);
            } else {
                resolve();
            }
        });
    });
}

async function copyFolder(source, destination, options = defaultOptions) {
    try {
        await ncpAsync(source, destination, options);
    } catch (errors) {
        for (let i = 0; i < errors.length; i++) {
            let error = errors[i];

            let newError = new Error(error.message);

            console.log(newError.stack);
        }
    }
}

async function copyTemplatesFolder() {
    let source = `${path.join(process.cwd(), 'src\\app\\templates')}`;
    let destination = `${path.join(process.cwd(), 'generators\\app\\templates')}`;

    await copyFolder(source, destination);
}

(async function() {
    await copyTemplatesFolder();
})();

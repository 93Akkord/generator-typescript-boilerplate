import * as Generator from 'yeoman-generator';
import * as _ from 'lodash';
import { exec } from './command-line-helpers';

export default class extends Generator {
    answers: Generator.Answers;

    constructor(args: string | string[], options: {}) {
        super(args, options);

        this.argument('project_name', { type: String, required: false, default: this.appname.replace(/\s/g, '_') });
    }

    initializing() {}

    async writing() {
        await this._vsCodeFiles();
        await this._rootFiles();
    }

    install() {
        this._npmInstall();
    }

    async _vsCodeFiles() {
        this.fs.copy(this.templatePath('_vscode/settings.json'), this.destinationPath('.vscode/settings.json'));
    }

    async _rootFiles() {
        const today = new Date();
        const config = await this._getGitConfig();

        this.fs.copyTpl(this.templatePath('_package.json'), this.destinationPath('package.json'), { appname: _.kebabCase(this.options.project_name), name: config['user.name'], email: config['user.email'] });

        // copy files common for all configurations
        this.fs.copy(this.templatePath('src/index.ts'), this.destinationPath('src/index.ts'));
        this.fs.copy(this.templatePath('README.md'), this.destinationPath('README.md'));
        this.fs.copy(this.templatePath('_tsconfig.json'), this.destinationPath('tsconfig.json'));
        this.fs.copy(this.templatePath('gitignore'), this.destinationPath('.gitignore'));
        this.fs.copy(this.templatePath('npmignore'), this.destinationPath('.npmignore'));
        this.fs.copyTpl(this.templatePath('LICENSE'), this.destinationPath('LICENSE'), { year: today.getFullYear().toPrecision(4) });
    }

    _npmInstall() {
        this.npmInstall(['@types/node', 'typescript', 'typescript-tslint-plugin', 'tslint'], { 'save-dev': true });
    }

    async _getGitConfig() {
        let res = await exec('git config --list');

        let lines = res.split('\n');
        let config = {};

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let setting = line.split('=')[0];
            let value = line.split('=')[1];

            config[setting] = value;
        }

        return config;
    }
}

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import validatePeerDependencies from 'validate-peer-dependencies';
import { Plugin } from 'release-it';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// resolving peer dependencies relative to `process.cwd()` so that the peer dependency validation still works properly through `npm link` scenarios
validatePeerDependencies(__dirname, {
  resolvePeerDependenciesFrom: process.cwd(),
});

export default class GHChangelogGeneratorPlugin extends Plugin {
  async init() {
    this._fromReference =
      (await this.getTagForHEAD()) || (await this.getFirstCommit());
  }

  async getTagForHEAD() {
    try {
      return await this.exec('git describe --tags --abbrev=0', {
        options: { write: false },
      });
    } catch (error) {
      return null;
    }
  }

  async getFirstCommit() {
    if (this._firstCommit) {
      return this._firstCommit;
    }

    this._firstCommit = await this.exec(`git rev-list --max-parents=0 HEAD`, {
      options: { write: false },
    });

    return this._firstCommit;
  }
}

import { describe, expect, test } from '@jest/globals';
import { factory, runTasks } from 'release-it/test/util/index.js';
import tmp from 'tmp';

import Plugin from './index.js';

tmp.setGracefulCleanup();

class TestPlugin extends Plugin {
  constructor() {
    super(...arguments);

    // basic harness for mocking executable command output
    this.responses = {
      // always assume v1.0.0 unless specifically overridden
      'git describe --tags --abbrev=0': 'v1.0.0',
    };

    this.commands = [];
    this.shell.execFormattedCommand = async (command, options) => {
      this.commands.push([command, options]);
      if (this.responses[command]) {
        let response = this.responses[command];

        if (typeof response === 'string') {
          return response;
        } else if (
          typeof response === 'object' &&
          response !== null &&
          response.reject === true
        ) {
          throw new Error(response.value);
        }
      }
    };
  }
}

function buildPlugin(config = {}, _Plugin = TestPlugin) {
  const namespace = '@release-it-plugins/gh-changelog';
  const options = { [namespace]: config };
  const plugin = factory(_Plugin, { namespace, options });

  return plugin;
}

describe('@release-it-plugins/gh-changelog', () => {
  test('it determines the latest tag', async () => {
    let plugin = buildPlugin();

    await runTasks(plugin);

    expect(plugin.commands).toMatchInlineSnapshot(`
      [
        [
          "git describe --tags --abbrev=0",
          {
            "write": false,
          },
        ],
      ]
    `);
  });

  test('it falls back to determining first commit if no tags exist', async () => {
    let plugin = buildPlugin();

    Object.assign(plugin.responses, {
      'git describe --tags --abbrev=0': {
        reject: true,
        value: 'fatal: No names found, cannot describe anything.',
      },
      'git rev-list --max-parents=0 HEAD': 'aabc',
    });

    await runTasks(plugin);

    expect(plugin.commands).toMatchInlineSnapshot(`
      [
        [
          "git describe --tags --abbrev=0",
          {
            "write": false,
          },
        ],
        [
          "git rev-list --max-parents=0 HEAD",
          {
            "write": false,
          },
        ],
      ]
    `);
  });
});

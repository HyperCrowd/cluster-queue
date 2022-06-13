import { Cluster } from '../src';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

test('Test primary', async () => {
  const instance = new Cluster(
    [
      {
        command: 'dist',
        action: () => undefined,
      },
      {
        command: 'cli:setText',
        description: 'Sets text in the primary process',
        args: {
          '<text>': 'The name of the state to set',
        },
        options: {
          '-f': 'First character only',
        },
        action: async (command, state, sends) => {
          state.text =
            command.args.f === true
              ? command.args.cli.text[0]
              : command.args.cli.text;

          console.log('setText', state);
        },
      },
      {
        command: 'iterate',
        action: async (command, state, sends) => {
          if (state.value === undefined) {
            state.value = 0;
          }

          state.value += 1;
          console.log('Iterated value:', state.value);
        },
      },
    ],
    true
  ).onCommand(
    async (command, state, sends) => {
      console.info(`Primary Message: ${command.command}`);
    },
    async (command, state, sends) => {
      console.info(`Worker Message: ${command.command}`);
      sends.enqueueJob(
        'iterateState',
        {
          commands: 1,
        },
        'primary'
      );
    }
  );

  await instance.start(
    async (primary) => {
      console.info(`Primary ready`);
      primary.sends.enqueueJob('iterate');
    },
    async (worker) => {
      console.info(`Worker ${worker.pid} ready`);
    },
    false,
    0
  );
});

test.run();

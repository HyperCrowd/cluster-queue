import { Cluster } from '../src';
import { test } from 'uvu';

test('Test primary', async () => {
  const instance = new Cluster([
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
  ]).onCommand(
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

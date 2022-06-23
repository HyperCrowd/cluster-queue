import type { Primary } from '../src/primary';
import { Cluster } from '../src';
import { test } from 'uvu';
import * as assert from 'uvu/assert';

test('Test primary', async () => {
  const hits = {
    iterate: false,
    primaryMessage: false,
    workerMessage: false,
    primaryReady: false,
    workerReady: false
  }

  // @TODO: Threads and test suites are a bit tough
  const instance = await new Promise(async resolve => {
    const instance = new Cluster([
      {
        command: 'iterate',
        action: async (command, state, sends) => {
          if (state.value === undefined) {
            state.value = 0;
          }

          state.value += 1;
          hits.iterate = true
          console.log(hits)
          resolve(instance)
        },
      }
    ], true).onCommand(
      async (command, state, sends) => {
        hits.primaryMessage = true
        console.log(hits)
      },
      async (command, state, sends) => {
        hits.workerMessage = true
        sends.enqueueJob(
          'iterateState',
          {
            commands: 1,
          },
          'primary'
        );
        //console.log(hits)
      }
    );

    await instance.start(
      async (primary) => {
        hits.primaryReady = true
        primary.sends.enqueueJob('iterate');
        console.log(hits)
      },
      async (worker) => {
        //hits.primaryReady = true
        console.info(`Worker ${worker.pid} ready`);
        //console.log(hits)
      },
      false,
      1
    );
  })
  
  assert.is(hits.iterate, true)
  assert.is(hits.primaryMessage, true)
  assert.is(hits.primaryReady, true)
  assert.is(hits.workerMessage, true)
  assert.is(hits.workerReady, true)
  console.log((instance as Primary).state.iterate)
  // assert.is(instance.state.iterate, 1)
});

test.run();

import type { CliDefinition, iCommand, KeyPair } from './index.d';
import { Queue } from './queue';

export const internalCommands = {
  getNextJob: '_getNextJob',
  enqueueJob: '_enqueueJob',
  newJobNotice: '_newJobNotice',
  message: 'message',
};

export const defaultCommands: CliDefinition[] = [
  {
    command: 'log',
    action: console.log,
  },
  {
    command: 'next',
    action: (
      args: KeyPair,
      state: KeyPair,
      command: iCommand,
      primaryQueue: Queue,
      workerQueue: Queue
    ) => {
      const nextCommand = workerQueue.next(worker);
      //
    },
  },
  {
    command: 'request',
    action: (
      args: KeyPair,
      state: KeyPair,
      command: iCommand,
      primaryQueue: Queue,
      workerQueue: Queue
    ) => {
      //
    },
  },
];

import type { CliDefinition, iCommand, KeyPair } from './index.d';
import { Queue } from './queue';

export const internalCommands = {
  next: '_next',
  enqueue: '_enqueue',
  new: '_new',
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

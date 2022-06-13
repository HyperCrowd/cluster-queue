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
];

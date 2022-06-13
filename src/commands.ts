import type { CliDefinition, KeyPair, QuickSends } from './index.d';

import { Command } from './command';

export const internalCommands: {
  getNextJob: '_getNextJob';
  getNextPrimaryJob: '_getNextJob_primary';
  enqueueJob: '_enqueueJob';
  enqueueJobPrimary: '_enqueueJob_primary';
  newJobNotice: '_newJobNotice';
  message: 'message';
} = {
  getNextJob: '_getNextJob',
  getNextPrimaryJob: '_getNextJob_primary',
  enqueueJob: '_enqueueJob',
  enqueueJobPrimary: '_enqueueJob_primary',
  newJobNotice: '_newJobNotice',
  message: 'message',
};

export const defaultCommands: CliDefinition[] = [
  {
    command: 'log',
    action: async (command: Command, state: KeyPair, sends: QuickSends) => {
      console.log(command);
    },
  },
];

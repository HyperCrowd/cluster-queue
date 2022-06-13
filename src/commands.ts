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

/**
 * Default commands
 */
export const defaultCommands: CliDefinition[] = [
  {
    command: 'log',
    action: async (command: Command, state: KeyPair, sends: QuickSends) => {
      command.log();
      console.log('State:', state);
    },
  },
  {
    command: 'setState',
    action: async (command: Command, state: KeyPair, sends: QuickSends) => {
      for (const key of Object.keys(command.args)) {
        state[key] = command.args[key];
      }
    },
  },
  {
    command: 'iterateState',
    action: async (command: Command, state: KeyPair, sends: QuickSends) => {
      for (const key of Object.keys(command.args)) {
        if (state[key] === undefined) {
          state[key] = 0;
        }

        state[key] += command.args[key];
      }
    },
  },
];

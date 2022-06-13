import type { CommandTo, KeyPair } from './index.d';

import { Command } from './command';
import { internalCommands } from './commands';
import { Primary } from './primary';

export function getPrimaryEvents(primary: Primary) {
  return {
    /**
     * @TODO
     */
    getNextJob: () => {
      return primary.process.emit(
        'message',
        new Command(
          internalCommands.getNextPrimaryJob,
          {},
          'primary',
          internalCommands.getNextPrimaryJob
        )
      );
    },

    /**
     * @TODO
     */
    enqueueJob: (
      command: string,
      args: KeyPair = {},
      to: CommandTo = 'workers'
    ) => {
      if (to === 'primary') {
        return primary.process.emit(
          'message',
          new Command(
            command,
            args,
            'primary',
            internalCommands.enqueueJobPrimary
          )
        );
      } else {
        return primary.process.emit(
          'message',
          new Command(command, args, 'primary', internalCommands.enqueueJob)
        );
      }
    },

    /**
     * @TODO
     */
    newJobNotice: () => {
      return primary.process.emit(
        'message',
        new Command(
          internalCommands.newJobNotice,
          {},
          'primary',
          internalCommands.newJobNotice
        )
      );
    },

    /**
     * @TODO
     */
    message: async (command: string, args: KeyPair = {}) => {
      return primary.process.emit(
        'message',
        new Command(command, args, 'primary', internalCommands.message)
      );
    },
  };
}

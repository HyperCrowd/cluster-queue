import type { CommandTo, KeyPair } from './index.d';

import { Command } from './command';
import { internalCommands } from './commands';
import { Worker } from './worker';

export function getWorkerEvents(worker: Worker) {
  return {
    /**
     * @TODO
     */
    getNextJob: () => {
      return worker.process.send(
        new Command(
          internalCommands.getNextJob,
          {},
          worker.pid,
          internalCommands.getNextJob
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
        return worker.process.send(
          new Command(
            command,
            args,
            worker.pid,
            internalCommands.enqueueJobPrimary
          )
        );
      } else {
        return worker.process.send(
          new Command(command, args, worker.pid, internalCommands.enqueueJob)
        );
      }
    },

    /**
     * @TODO
     */
    newJobNotice: () => {
      return worker.process.send(
        new Command(
          internalCommands.newJobNotice,
          {},
          worker.pid,
          internalCommands.newJobNotice
        )
      );
    },

    /**
     * @TODO
     */
    message: async (command: string, args: KeyPair = {}) => {
      return worker.process.send(
        new Command(command, args, worker.pid, internalCommands.message)
      );
    },
  };
}

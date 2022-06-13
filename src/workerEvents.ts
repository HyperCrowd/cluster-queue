import type { CommandTo, KeyPair } from './index.d';

import { Command } from './command';
import { internalCommands } from './commands';
import { Worker } from './worker';

export function getWorkerEvents(worker: Worker) {
  return {
    /**
     *
     */
    getNextJob: () => {
      return worker.process.send(
        new Command('', {}, worker.pid, internalCommands.getNextPrimaryJob)
      );
    },

    /**
     *
     */
    enqueueJob: (command: string, args: KeyPair, to: CommandTo = 'workers') => {
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
     *
     */
    newJobNotice: () => {
      return worker.process.send(
        new Command('', {}, worker.pid, internalCommands.newJobNotice)
      );
    },

    /**
     *
     */
    message: async (command: string, args: KeyPair) => {
      return worker.process.send(
        new Command(command, args, worker.pid, internalCommands.message)
      );
    },
  };
}

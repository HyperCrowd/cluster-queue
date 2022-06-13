import type { KeyPair, QuickSends } from './index.d';
type Process = typeof cluster.worker;

import cluster from 'cluster';
import { Command } from './command';
import { internalCommands } from './commands';

export class Worker {
  process: Process;
  useLogging: boolean;
  state: KeyPair = {};
  sends: QuickSends;
  pid: number;

  constructor(
    process: Process,
    onCommand: (command: Command) => Promise<Command | void>,
    useLogging: boolean = false
  ) {
    this.process = process;
    this.useLogging = useLogging;
    this.pid = this.process.process.pid;

    this.sends = {
      getNextJob: () => {
        return this.process.send(
          new Command(
            internalCommands.getNextJob,
            {},
            this.pid,
            internalCommands.getNextJob
          )
        ); // @TODO;
      },
      enqueueJob: (command: string, args: KeyPair) => {
        return this.process.send(
          new Command(command, args, this.pid, internalCommands.enqueueJob) // @TODO
        );
      },
      newJobNotice: () => {
        // @TODO
      },
      message: async (command: string, args: KeyPair) => {
        if (this.useLogging) {
          console.log('Worker Message:', command);
        }

        return this.process.send(
          new Command(command, args, this.pid, internalCommands.message) // @TODO
        );
      },
    };
    /**
     * Primary receives a general message from worker
     */
    process.on(internalCommands.message, async (command: Command) => {
      if (this.useLogging) {
        console.log('Primary Message:', command);
      }
      const newCommand = await onCommand(command);

      // @TODO
      if (newCommand === undefined) {
        await command.run(this.state, this.sends);
      } else {
        await (newCommand as Command).run(this.state, this.sends);
      }
    });
  }

  /**
   * Kills the worker
   */
  kill() {
    this.process.removeAllListeners();
    this.process.kill('SIGKILL');
    this.process = undefined;
  }
}

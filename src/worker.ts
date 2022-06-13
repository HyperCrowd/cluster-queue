import type { CommandAction, KeyPair, QuickSends } from './index.d';
type Process = typeof cluster.worker;

import cluster from 'cluster';
import { Command } from './command';
import { internalCommands } from './commands';
import { getWorkerEvents } from './workerEvents';

export class Worker {
  process: Process;
  useLogging: boolean;
  state: KeyPair = {};
  sends: QuickSends;
  pid: number;

  constructor(
    process: Process,
    onCommand: CommandAction,
    useLogging: boolean = false
  ) {
    this.process = process;
    this.useLogging = useLogging;
    this.pid = this.process.process.pid;

    this.sends = getWorkerEvents(this);

    /**
     * Primary receives a general message from worker
     */
    process.on(internalCommands.message, async (command: Command) => {
      if (this.useLogging) {
        console.log('Worker Message:', command);
      }
      const newCommand = await onCommand(command, this.state, this.sends);

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

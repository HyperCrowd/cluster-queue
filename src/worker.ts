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
  isWorking: boolean = false;

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
    process.on(internalCommands.message, async (json: KeyPair) => {
      if (this.isWorking) {
        return;
      }

      this.isWorking = true;
      const command = Command.fromJSON(json);

      if (this.useLogging) {
        console.log(`[PID ${this.pid}] :`, command);
      }

      switch (command.to) {
        case internalCommands.newJobNotice:
          this.sends.getNextJob();
          break;

        case internalCommands.message:
          break;
      }

      const newCommand = await onCommand(command, this.state, this.sends);

      if (newCommand === undefined) {
        await command.run(this.state, this.sends);
      } else {
        await (newCommand as Command).run(this.state, this.sends);
      }
      this.isWorking = false;

      this.sends.getNextJob();
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

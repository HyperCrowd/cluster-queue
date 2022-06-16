import type { CommandAction, KeyPair, QuickSends } from './index.d';
type Process = typeof cluster.worker;

import cluster from 'cluster';
import { Command } from './command';
import { internalCommands } from './commands';
import { getWorkerEvents } from './workerEvents';
import { Threads } from './threads';

export class Worker {
  process: Process;
  useLogging: boolean;
  state: KeyPair = {};
  sends: QuickSends;
  pid: number;
  isWorking: boolean = false;
  threads: Threads<Command, Object>;

  constructor(
    process: Process,
    onCommand: CommandAction,
    useLogging: boolean = false
  ) {
    this.process = process;
    this.useLogging = useLogging;
    this.pid = this.process.process.pid;
    this.sends = getWorkerEvents(this);
    this.threads = new Threads(__dirname + '/threadworker.ts');

    /**
     * Primary receives a general message from worker
     */
    process.on(internalCommands.message, async (json: KeyPair) => {
      if (this.isWorking) {
        return;
      }

      this.isWorking = true;
      const command = Command.fromJSON(json);

      switch (command.to) {
        case internalCommands.newJobNotice:
          this.sends.getNextJob();
          break;

        case internalCommands.message:
          break;
      }

      const newCommand = await onCommand(command, this.state, this.sends);

      await this.threads.run([command], () => command);
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

import type { iQueue } from './index.d';
import cluster from 'cluster';
import { Command } from './command';

type Primary = typeof cluster;
type Worker = typeof cluster.worker;

export class Queue implements iQueue {
  queue: Command[] = [];
  primary: Primary;

  constructor(primary: Primary) {
    this.primary = primary;
  }

  /**
   * Adds a command to the queue
   */
  add(command: Command) {
    const index = this.queue.push(command);
    this.primary.emit('newCommand', command.to);
    return index;
  }

  /**
   * Removes the first command from the queue
   */
  shift() {
    return this.queue.shift();
  }

  /**
   * Gets the first command in the queue and may send it to the worker to do
   */
  next(worker?: Worker): Command | undefined {
    const command = this.queue.shift();

    if (command === undefined) {
      return;
    }

    const pid = cluster.isPrimary ? 'primary' : worker.process.pid;
    const newCommand = command.clone('primary', pid);

    if (worker) {
      worker.send(newCommand);
    }

    return newCommand;
  }
}

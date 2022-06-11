type Priamry = typeof cluster;
type Worker = typeof cluster.worker;
import type { iQueue } from './index.d';

import cluster from 'cluster';
import { Command } from './command';

export class Queue implements iQueue {
  queue: Command[] = [];
  primary: Priamry;

  /**
   *
   */
  constructor(primary: Priamry) {
    this.primary = primary;
  }

  /**
   *
   */
  add(command: Command) {
    const index = this.queue.push(command);
    this.primary.emit('newCommand', command.to);
    return index;
  }

  /**
   *
   */
  shift() {
    return this.queue.shift();
  }

  /**
   *
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

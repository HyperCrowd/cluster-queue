type Priamry = typeof cluster;
type Worker = typeof cluster.worker;

import cluster from 'cluster';
import { Command } from './command';

export class Queue {
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

    const newCommand = command.clone('primary', worker.process.pid);

    if (worker) {
      worker.send(newCommand);
    }

    return newCommand;
  }
}

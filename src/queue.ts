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
    console.log(this.queue);
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
    console.log('this.queue', this.queue);
    const command = this.queue.shift();
    console.log('this.queue.shift()', command);
    if (command === undefined) {
      return;
    }

    const newCommand = command.clone('primary', worker.process.pid);
    console.log('newCommand', newCommand);
    if (worker) {
      worker.send(newCommand);
    }

    return newCommand;
  }
}

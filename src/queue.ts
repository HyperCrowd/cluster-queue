import type { CommandTo, iQueue } from './index.d';
import cluster from 'cluster';
import { Command } from './command';

export class Queue implements iQueue {
  queue: Command[] = [];

  /**
   * Adds a command to the queue
   */
  add(command: Command) {
    const index = this.queue.push(command);
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
  getNext(to: CommandTo): Command | undefined {
    const command = this.queue.shift();

    if (command === undefined) {
      return;
    }

    const newCommand = command.clone('primary', to);

    return newCommand;
  }
}

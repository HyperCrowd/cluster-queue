import type { CliDefinition, CommandAction } from './index.d';
import cluster from 'cluster';
import { Cli } from './cli';
import { Primary } from './primary';
import { defaultCommands } from './commands';
import { Command } from './command';
import { Worker } from './worker';

const noop = () => undefined;

export class Cluster {
  cliCommands: CliDefinition[] = [];
  useLogging: boolean;
  onPrimaryCommand: CommandAction = noop;
  onWorkerCommand: CommandAction = noop;

  constructor(commands: CliDefinition[] = [], useLogging: boolean = false) {
    this.useLogging = useLogging;

    // Default actions
    for (const defaultCommand of defaultCommands.concat(commands)) {
      if (defaultCommand.command.indexOf('cli:') === 0) {
        // Register CLI commands
        this.cliCommands.push(defaultCommand);
      } else {
        // Register actions
        Command.register(defaultCommand.command, defaultCommand.action);
      }
    }

    return this;
  }

  /**
   * Cluster node command handlers
   */
  onCommand(onPrimaryCommand: CommandAction, onWorkerCommand: CommandAction) {
    this.onPrimaryCommand = onPrimaryCommand;
    this.onWorkerCommand = onWorkerCommand;
    return this;
  }

  /**
   * Start the cluster nodes
   */
  async start(
    onPrimaryStart: (primary: Primary) => Promise<void> = noop,
    onWorkerStart: (worker: Worker) => Promise<void> = noop,
    cliActive: boolean = true,
    maxCpus?: number
  ) {
    if (cluster.isPrimary) {
      const cli = new Cli(this.cliCommands, cliActive);
      const primary = new Primary(
        cluster,
        cli,
        this.onPrimaryCommand,
        this.useLogging
      );

      // Parse the CLI
      cli.start();

      // Wait for the primary queue to be empty
      await primary.start(maxCpus);
      await onPrimaryStart(primary);
    } else {
      await onWorkerStart(
        new Worker(cluster.worker, this.onWorkerCommand, this.useLogging)
      );
    }
  }
}

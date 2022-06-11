import type { Command } from './command';

export interface KeyPair<T = any> {
  [key: string]: T;
}

export type CommandAction = (args: KeyPair) => Command;

export interface CliDefinition {
  command: string;
  description: string;
  args: KeyPair;
  options: KeyPair;
  action: CommandAction;
}

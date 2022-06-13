# Cluster-Queue

Easily sets up primary and worker clustering, allowing primary to contain pending jobs and for workers to grab them off the queue the moment they are availible.

## Install

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/hypercrowd/cluster-queue)

`npm i -S @psysecgroup/cluster-queue` or `yarn add @psysecgroup/cluster-queue`

## What It Does

ClusterQueue arcchitecture allows for the following:

![Try on StackBlitz](/docs/concept.png)

ClusterQueue utilizes the following queue strategy for event looping:

![Try on StackBlitz](/docs/queue.png)

## Getting Starting

The very bare-minimum needed to get ClusterQueue working:

```ts
import { Cluster } from '@psysecgroup/cluster-queue';

const instance = new Cluster();
await instance.start();
```

Here's a detailed breakdown of use every feature of ClusterQueue:

```ts
// example.js

import { Cluster } from '@psysecgroup/cluster-queue';

const instance = new Cluster([
  {
    command: 'cli:setText',
    description: 'Sets text in the primary process',
    args: {
      '<text>': 'The name of the state to set',
    },
    options: {
      '-f': 'First character only',
    },
    action: async (command, state, sends) => {
      state.text =
        command.args.f === true
          ? command.args.cli.text[0]
          : command.args.cli.text;

      console.log('setText', state);
    },
  },
  {
    command: 'iterate',
    action: async (command, state, sends) => {
      if (state.value === undefined) {
        state.value = 0;
      }

      state.value += 1;
      console.log('Iterated value:', state.value);
    },
  }],
  true
).onCommand(
  async (command, state, sends) => {
    console.info(`Primary Message: ${command.command}`);
  },
  async (command, state, sends) => {
    console.info(`Worker Message: ${command.command}`);
    sends.enqueueJob('iterateState', { commands: 1 }, 'primary');
  }
);
```

Command definitions allow for CLI and event definitions.

CLI command are specified with a `cli:` in the front of the command name while the `description`, `args`, `options`, and `actions` use a variation of the [Commander](https://www.npmjs.com/package/commander) format.

Event definition only need the `command` and `action` properties defined.

After saving the above code to `example.js`, you can try out the above code by typing `node example.js setText -f test`

## CLI

### npm

- `npm run build`: Builds the source TypeScript to CommonJS, ESM, and IIFE JavaScript files in [`dist`](dist)
- `npm run sb-watch`: Watches for changes for TypeScript files, builds the source on a change, then runs [`dist/index.js`](dist/index.js) (StackBlitz-friendly)
- `npm run watch`: Watches for changes for TypeScript files, builds the source on a change, then runs [`dist/index.js`](dist/index.js) (Every other system)

### yarn

- `yarn build`: Builds the source TypeScript to CommonJS, ESM, and IIFE JavaScript files in [`dist`](dist)
- `yarn sb-watch`: Watches for changes for TypeScript files, builds the source on a change, then runs [`dist/index.js`](dist/index.js) (StackBlitz-friendly)
- `yarn watch`: Watches for changes for TypeScript files, builds the source on a change, then runs [`dist/index.js`](dist/index.js) (Every other system)

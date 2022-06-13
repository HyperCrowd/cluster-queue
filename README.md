# Cluster-Queue

Easily sets up primary and worker clustering, allowing primary to contain pending jobs and for workers to grab them off the queue the moment they are availible.

## Install

[![Try on StackBlitz](/docs/try.png)](https://stackblitz.com/edit/psysecgroup-cluster-queue)

`npm i -S @psysecgroup/cluster-queue` or `yarn add @psysecgroup/cluster-queue`

## What It Does

Arcchitecture:

![Try on StackBlitz](/docs/concept.png)

Queueing:

![Try on StackBlitz](/docs/queue.png)

## Getting Starting

The very bare-minimum needed to get Cluster-Queue working:

```ts
import { Cluster } from '@psysecgroup/cluster-queue';

const instance = new Cluster();
await instance.start();
```

Here's a detailed breakdown of use every feature of Cluster-Queue:

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

CLI command definition follows [Commander](https://www.npmjs.com/package/commander)

To run the above code, run `node example.js setState -f test`

## CLI

### npm

- `npm run build`: Builds the source TypeScript to CommonJS, ESM, and IIFE JavaScript files in [`dist`](dist)
- `npm run sb-watch`: Watches for changes for TypeScript files, builds the source on a change, then runs [`dist/index.js`](dist/index.js) (StackBlitz-friendly)
- `npm run watch`: Watches for changes for TypeScript files, builds the source on a change, then runs [`dist/index.js`](dist/index.js) (Every other system)

### yarn

- `yarn build`: Builds the source TypeScript to CommonJS, ESM, and IIFE JavaScript files in [`dist`](dist)
- `yarn sb-watch`: Watches for changes for TypeScript files, builds the source on a change, then runs [`dist/index.js`](dist/index.js) (StackBlitz-friendly)
- `yarn watch`: Watches for changes for TypeScript files, builds the source on a change, then runs [`dist/index.js`](dist/index.js) (Every other system)

# Cluster-Queue

Easily sets up primary and worker clustering, allowing primary to contain pending jobs and for workers to grab them off the queue the moment they are availible.

## Install

[![Try on StackBlitz](/docs/try.png)](https://stackblitz.com/edit/psysecgroup-cluster-queue)

`npm i -S @psysecgroup/cluster-queue` or `yarn add @psysecgroup/cluster-queue`

## What It Does

![Try on StackBlitz](/docs/concept.png)

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

const instance = new Cluster([{
  // An example of a CLI command
  command: 'cli:setState',
  description: 'Sets a state in the primary process',
  args: {
    '<text>': 'The name of the state to set',
  },
  options: {
    '-f': 'Force the text'
  },
  action: async (command, state, sends) => {
    state.text = command.args.cli.text;
    console.log('setState', state);
  }
}, {
  // An example of a queue-able command
  command: 'test',
  action: async (command, state, sends) => {
    sends.message('log', {
      message: 'wee'
    })
  }
}]).onCommand(
  async (command, state, sends) => {
    console.log('New Primary Command:', command);
    console.log('Current Primary State:', state);
  },
  async (command, state, sends) => {
    console.log('New Worker Command:', command);
    console.log('Current Worker State:', state);
  }
);

await instance.start(
  async (primary) => {
    console.log('Worker has started');
  },
  async (worker) => {
    console.log('Worker has started');
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

# Cluster-Queue

Easily sets up primary and worker clustering, allowing primary to contain pending jobs and for workers to grab them off the queue the moment they are availible.

## Demo

![~[Try on StackBlitz](https://i.ibb.co/1JknZ30/sb.png)](https://stackblitz.com/edit/psysecgroup-cluster-queue)

## Install

(Coming soon)

`npm i -S @psysecgroup/cluster-queue` or `yarn add @psysecgroup/cluster-queue`

## CLI

Source map support is currently experimental

### npm

- `npm run build`: Builds the source TypeScript to CommonJS, ESM, and IIFE JavaScript files in [`dist`](dist)
- `npm run sb-watch`: Watches for changes for TypeScript files, builds the source on a change, then runs [`dist/index.js`](dist/index.js) (StackBlitz-friendly)
- `npm run watch`: Watches for changes for TypeScript files, builds the source on a change, then runs [`dist/index.js`](dist/index.js) (Every other system)

### yarn

- `yarn build`: Builds the source TypeScript to CommonJS, ESM, and IIFE JavaScript files in [`dist`](dist)
- `yarn sb-watch`: Watches for changes for TypeScript files, builds the source on a change, then runs [`dist/index.js`](dist/index.js) (StackBlitz-friendly)
- `yarn watch`: Watches for changes for TypeScript files, builds the source on a change, then runs [`dist/index.js`](dist/index.js) (Every other system)

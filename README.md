# Cluster-Queue

Easily sets up primary and worker clustering, allowing primary to contain pending jobs and for workers to grab them off the queue the moment they are availible.

## Demo

[![Try on StackBlitz](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJcAAAAoCAMAAADE3ZjrAAAAgVBMVEU7YZ4wVI9EeMwbRIciVasAAAAAAABEd8w2X6P////r7/fM2O10mdnf5vP1+PyjuuVCdckvU462yeri6vbx9PjO2/KIqd8xWJmyw9+uu9BBccOHoMk9br7Z4fA9arbJ1OU6Za45YqdjgK7R1+OgttubsNKZqsZ7krdRb6GFpNdsi75F71IbAAAAB3RSTlP5qpX18jMA9nAroQAAAk9JREFUWMPt1tluozAUBmDaWQ628YINgRC20CyTvv8DzrEJE5oUTyJFFZX4b5zYFnz4mCX49RKE/sDX5/V38BKG83PBaxDM0gVBuLgW178srsW1uBbXV8TvyqZcZezSwnSK7GZcbWvbXPVlBUDdPuLqDsGESxMX42HtcZyXME5EmW2u+sgOgPEHXJuEvP2ZrCOjEUxH7UmKfH2HK2HqMVdOCML8riIswjhUatva6obqcrphLWusd93XtbMutY3jrRq5KnpyrtJujKHWdTvt6ioH87pkchBEbCLKFahcrIZRKeSZ1eBBmrqvK2Gg3ikh9F2N1tDk1lXmtvDteU0Zn3BlmAHmcxGigXOlxelDmTTpXYqhdSUatSPaTXALaWg0csmqQEZOJNjL4wzaGjj73NWtXRIH87o0QEqjlchhJ+S1y1HcXMb7PzI5xvFByJErMjuGHrtCeHnM0tSUqyGXvG09ruEMeDhmLqNS7FxrvQBYYN67hjt57IKUMY5tfzhN99ScqP6/y3R3uGSyMf3Ps6cpAcoyoo2CoqER1hq3FrPzbu7RFa84cF64HSqNZlWeyM9d+0TYWFayCe9wAU84jJKSdRznGlJxjA9EgxbHjhKGDh7bG3Lsgspw0OQQH0UKK2qkrujK81zN1hfWjSu9cmk8+Tj6/Nw12Oq+TU1qIdgx3vfYJ+3MFPvduN2tNBq7vCz/+9E9JJ6ZadcHlt9VZEehwZMnu5B1l0vaEvjyRBfCqs08v3Pm+v21uBbX4lpc38OlgmyWrjL4kc3PpcqffwGk28P4enEUDwAAAABJRU5ErkJggg==)](https://stackblitz.com/edit/psysecgroup-cluster-queue)

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

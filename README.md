# Cluster-Queue

Easily sets up primary and worker clustering, allowing primary to contain pending jobs and for workers to grab them off the queue the moment they are availible.

## Demo

[![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJEAAAAbCAMAAABLLZ2vAAAAwFBMVEUAAAADGgMDGgMDGgMKJwkDGgMDGgMsWiMQPxF+22Q6mzgtjzADGgOK52x11F9Boz5ty1kKgS////8zlTSE4WgniSxkw1NKq0NSs0lcu04ajDPl9OP2/PXL6cjr9ut2zGgnljkznT3w+fCGx4UmkkIikDbT6dfQ7cwXiDu847nY8dTD5r+73cKt36VTqmVmulqd2ZOS1oal2aCSz4trtXxuwWOj0a6VzJoogSp5uoyD1XB6w3RBoFY/dzIYUhgebyJdE8KxAAAACXRSTlMANunQwZgd8O5fsShxAAADZklEQVRIx82X6XLaMBSFzdYkTop9b1tZWLK8G4zZIQXSJH3/t+qVDJQl0+ZPJnyDjefoWPoQwwy2DI1Oq/nwuTRbnYa150v7ZXr39bO5m760v+w26ObzdXZSNw2zQzffr4cbvUvt7t310G3Td/Zyd028NKwO714TvGO12D/Gh2jod9/BU19KVb05spsANWKmr4b69RasZTXdfyOl+z6EeOqOsXLnwfnIE5qoi4JOQoZubeReVomm9eAemFVPF4VIKiCi/wqFOGQRgB+juBwKINJvAgB+4oRTFyIGEVUveLAe2IEZ4nDOzpASIMS+UgWGzJXChGEgkyBktFQgRX2Lizh67jGnQMSYzQQmJfWGUlbGaIRjl4z8UKgMGPYH2Add/Ykalx04MWLzMkE1fstIhuEMx2xOh0aoMEyEtkhDmTDDAhHJkpl1sWRjnDMlwjmWIVZrChgaFjFwY1RXGetjwE6Mekc4A3LunSATs0cQ+bKAEh/B7/VIjEdrXDEsIAow80wz1Z951qMMYDobJbha4YLnAM+YYNGLQAs8BjjZ71FuqimqAUBvz6lRWkkUW4jPjR6xAuAlZsnQ0aMLXPqwxG2GAUCAg9188aRAxc26iVilmK5wBj53MiQmENMIwARH9t7IVCWmOeTHRvzAErFIeQTAj6iNSpr5F45wFoGni2uIx7gakJHfx2x/g+Mn0uzEAlOe4mqie5xPUTzjyCfXehbwMDC36qDAMj5e8dSofLRzAIjPjaZklHOuEDnNSSiVTdQwNtMGmGnLFKspnX6CUgN/iYuswBSUyCaUY2V+YsaoojjbGSVqsEXBAewTI+8IsvVj74SDkeeN6YNCpMPpKFElj/4aEcuhRDXmsJUq45UUC7KbBElS0h6NIJNFhhq1cA5Ga6kKE/7yDpwb5Y53AdCCDviet8YtQF1w6IKyOvfrMAbfcWIKdCmCyAFzODbllOYQO2YqH2LPqTNdjXT92Kjp/AezuE23c4HPNFGN7YO51icyMkRA5OZdh5CDv+vZ+qAUDBF1jZGpGsh2R9Nq2WcCHGt+neUpqjSn2T4Wu2V1Nvb7AbA/mE3HarxepN+gJj/Lcx19MK8Ny2rff7se7tv6f/bt/fVwa55GGreb++tgc9vYP6+9/t78+Gw2v1/N89r1PdP+Ac1DEPmrQ3VrAAAAAElFTkSuQmCC)](https://stackblitz.com/edit/psysecgroup-cluster-queue)

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

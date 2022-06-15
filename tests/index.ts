import cluster from 'cluster';

if (cluster.isWorker) {
  process.exit(0);
}

import './primaryTest';

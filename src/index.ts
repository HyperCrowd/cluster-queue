import cluster from 'cluster';
import { Cli } from './cli';
import { Master } from './master';
import { Queue } from './queue';

export function startCluster(
  onMasterStart: (master: Master) => void,
  onMasterMessage: (worker: typeof cluster.worker, message: any) => void,
  onWorkerStart: (worker: typeof cluster.worker) => void,
  onWorkerMessage: (message: any) => void
) {
  if (cluster.isPrimary) {
    const primaryQueue = new Queue(cluster);
    const workerQueue = new Queue(cluster);
    const cli = new Cli(primaryQueue);
    const master = new Master(
      cluster,
      cli,
      primaryQueue,
      workerQueue,
      onMasterMessage,
      onWorkerMessage,
      true
    );
    onMasterStart(master);
  } else {
    const worker = cluster.worker;
    onWorkerStart(worker);
  }
}

// @TODO: build a test bench

startCluster(
  () => {},
  () => {},
  () => {},
  () => {}
);

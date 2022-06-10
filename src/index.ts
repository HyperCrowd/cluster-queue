import cluster from 'cluster';
import { Master } from './master';

export function startCluster(
  onMasterStart: (master: Master) => void,
  onMasterMessage: (worker: typeof cluster.worker, message: any) => void,
  onWorkerStart: (worker: typeof cluster.worker) => void,
  onWorkerMessage: (message: any) => void
) {
  if (cluster.isPrimary) {
    const master = new Master(cluster, onMasterMessage, onWorkerMessage);
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

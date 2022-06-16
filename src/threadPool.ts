import { Worker } from 'worker_threads';

require('ts-node').register();

type QueueCallback<ResultObject> = (err: any, result?: ResultObject) => void;

interface QueueItem<DataObject, ResultObject> {
  callback: QueueCallback<ResultObject>;
  getData: () => DataObject;
}

export class WorkerPool<DataObject, ResultObject> {
  private queue: QueueItem<DataObject, ResultObject>[] = [];
  private workersById: { [key: number]: Worker } = {};
  private activeWorkersById: { [key: number]: boolean } = {};

  public constructor(
    public workerPath: string,
    public numberOfThreads: number
  ) {
    if (this.numberOfThreads < 1) {
      return null;
    }

    for (let i = 0; i < this.numberOfThreads; i += 1) {
      const worker = new Worker(this.workerPath);

      this.workersById[i] = worker;
      this.activeWorkersById[i] = false;
    }
  }

  /**
   *
   */
  private getInactiveWorkerId(): number {
    for (let i = 0; i < this.numberOfThreads; i += 1) {
      if (!this.activeWorkersById[i]) {
        return i;
      }
    }

    return -1;
  }

  /**
   *
   */
  private async runWorker(
    workerId: number,
    queueItem: QueueItem<DataObject, ResultObject>
  ) {
    const worker = this.workersById[workerId];

    this.activeWorkersById[workerId] = true;

    const messageCallback = (result: ResultObject) => {
      queueItem.callback(null, result);

      cleanUp();
    };

    const errorCallback = (error: any) => {
      queueItem.callback(error);

      cleanUp();
    };

    const cleanUp = () => {
      worker.removeAllListeners('message');
      worker.removeAllListeners('error');

      this.activeWorkersById[workerId] = false;

      if (!this.queue.length) {
        return null;
      }

      this.runWorker(workerId, this.queue.shift());
    };

    worker.once('message', messageCallback);
    worker.once('error', errorCallback);

    worker.postMessage(await queueItem.getData());
  }

  /**
   *
   */
  public run(getData: () => DataObject) {
    return new Promise<ResultObject>((resolve, reject) => {
      const availableWorkerId = this.getInactiveWorkerId();

      const queueItem: QueueItem<DataObject, ResultObject> = {
        getData,
        callback: (error, result) => {
          if (error) {
            return reject(error);
          }

          return resolve(result);
        },
      };

      if (availableWorkerId === -1) {
        this.queue.push(queueItem);

        return null;
      }

      this.runWorker(availableWorkerId, queueItem);
    });
  }
}

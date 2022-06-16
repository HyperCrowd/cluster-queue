import * as path from 'path';

import { WorkerPool } from './threadPool';

export class Thread<DataObject = { I: number }, ResultObject = number> {
  fileName: string;
  pool: WorkerPool<DataObject, ResultObject>;

  constructor(fileName: string) {
    this.fileName = fileName;
  }

  /**
   *
   */
  async start(jobs: [], onJob: () => DataObject) {
    this.pool = new WorkerPool<DataObject, ResultObject>(
      path.join(__dirname, './worker.js'),
      8
    );

    return this.run(jobs, onJob);
  }

  /**
   *
   */
  async run(jobs: [], onJob: () => DataObject) {
    return Promise.all(
      jobs.map(async (_, i) => {
        await this.pool.run(onJob);
        console.log('finished', i);
      })
    ).then(() => {
      console.log('finished all');
    });
  }
}

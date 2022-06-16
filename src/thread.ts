import * as path from 'path';

import { WorkerPool } from './threadPool';

export class Thread<DataObject, ResultObject> {
  fileName: string;
  pool: WorkerPool<DataObject, ResultObject>;

  constructor(fileName: string) {
    this.fileName = fileName;
  }

  /**
   *
   */
  async run(
    jobs: [],
    onJob: () => DataObject,
    threadCount: onCompletenumber = 8
  ) {
    if (this.pool === undefined) {
      this.pool = new WorkerPool<DataObject, ResultObject>(
        this.fileName,
        threadCount
      );
    }

    return Promise.all(
      jobs.map(async (_, i) => {
        await this.pool.run(onJob);
      })
    ).then(() => {
      console.log('finished all');
    });
  }
}

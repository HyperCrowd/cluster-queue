import { WorkerPool } from './threadPool';

export class Threads<DataObject, ResultObject> {
  pool: WorkerPool<DataObject, ResultObject>;

  constructor(fileName: string, threadCount: number = 8) {
    this.pool = new WorkerPool<DataObject, ResultObject>(fileName, threadCount);
  }

  /**
   *
   */
  async run(jobs: DataObject[], onJob: () => DataObject) {
    return Promise.all(
      jobs.map(async (_, i) => {
        await this.pool.run(onJob);
      })
    ).then(() => {
      console.log('finished all');
    });
  }
}

import type { AutoDroidSdk } from '@package';

import { AdminDataset } from './dataset';
import { AdminProcessor } from './processor';
import { AdminWorker } from './worker';

export class Admin {
  public readonly dataset: AdminDataset;
  public readonly processor: AdminProcessor;
  public readonly worker: AdminWorker;

  constructor(private context: AutoDroidSdk) {
    this.dataset = new AdminDataset(this.context);
    this.processor = new AdminProcessor(this.context);
    this.worker = new AdminWorker(this.context);
  }
}

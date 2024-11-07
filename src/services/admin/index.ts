import type { AutoDroidSdk } from '@package';

import { AdminDataset } from './dataset';
import { AdminProcessor } from './processor';
import { AdminWorker } from './worker';
import { AdminProcessing } from './processing';

export class Admin {
  public readonly dataset: AdminDataset;
  public readonly processor: AdminProcessor;
  public readonly processing: AdminProcessing;
  public readonly worker: AdminWorker;

  constructor(private context: AutoDroidSdk) {
    this.dataset = new AdminDataset(this.context);
    this.processor = new AdminProcessor(this.context);
    this.worker = new AdminWorker(this.context);
    this.processing = new AdminProcessing(this.context);
  }
}

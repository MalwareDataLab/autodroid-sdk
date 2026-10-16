// SDK import
import type { AutoDroidSdk } from '@package';

// Service import
import { AdminDataset } from './dataset';
import { AdminFile } from './file';
import { AdminProcessing } from './processing';
import { AdminProcessor } from './processor';
import { AdminWorker } from './worker';

export class Admin {
  public readonly dataset: AdminDataset;
  public readonly file: AdminFile;
  public readonly processor: AdminProcessor;
  public readonly processing: AdminProcessing;
  public readonly worker: AdminWorker;

  constructor(private context: AutoDroidSdk) {
    this.dataset = new AdminDataset(this.context);
    this.file = new AdminFile(this.context);
    this.processor = new AdminProcessor(this.context);
    this.worker = new AdminWorker(this.context);
    this.processing = new AdminProcessing(this.context);
  }
}

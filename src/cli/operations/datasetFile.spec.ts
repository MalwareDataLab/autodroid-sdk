import { createHash } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// Target import
import {
  CONTENT_TYPE_BY_MIME_TYPE,
  readDatasetFile,
  uploadDatasetFile,
} from './datasetFile';

describe('Operations: dataset file', () => {
  let directory: string;

  beforeAll(() => {
    directory = mkdtempSync(join(tmpdir(), 'autodroid-dataset-file-'));
  });

  afterAll(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  const writeFixture = (name: string, content: string) => {
    const path = join(directory, name);
    writeFileSync(path, content);
    return path;
  };

  describe('readDatasetFile', () => {
    it('should describe a csv file the way the API asks for it', async () => {
      const content = 'a,b\n1,2\n';
      const path = writeFixture('samples.csv', content);

      const file = await readDatasetFile(path);

      expect(file).toEqual({
        filename: 'samples.csv',
        size: Buffer.byteLength(content),
        md5_hash: createHash('md5').update(content).digest('hex'),
        mime_type: 'CSV',
        content: Buffer.from(content),
      });
    });

    it.each([
      ['archive.zip', 'ZIP'],
      ['report.pdf', 'PDF'],
      ['image.png', 'PNG'],
      ['photo.jpg', 'JPEG'],
      ['photo.JPEG', 'JPEG'],
      ['notes.xyz', 'OTHER'],
      ['no-extension', 'OTHER'],
    ])('should classify %s as %s', async (name, expectedMimeType) => {
      const path = writeFixture(name, 'x');

      const file = await readDatasetFile(path);

      expect(file.mime_type).toBe(expectedMimeType);
    });

    it('should reject a file that does not exist', async () => {
      await expect(
        readDatasetFile(join(directory, 'missing.csv')),
      ).rejects.toThrowError(/ENOENT/);
    });
  });

  describe('uploadDatasetFile', () => {
    let server: http.Server;
    let baseUrl: string;
    let received: { method?: string; contentType?: string; body: string };
    let respondWithStatus = 200;

    beforeAll(async () => {
      server = http.createServer((req, res) => {
        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });
        req.on('end', () => {
          received = {
            method: req.method,
            contentType: req.headers['content-type'],
            body,
          };
          res.writeHead(respondWithStatus);
          res.end();
        });
      });
      await new Promise<void>(resolve => {
        server.listen(0, '127.0.0.1', resolve);
      });
      baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
    });

    afterAll(() => {
      server.closeAllConnections();
      server.close();
    });

    const csvFile = () => readDatasetFile(writeFixture('upload.csv', 'a,b\n'));

    it('should PUT the content with the content type the URL was signed for', async () => {
      respondWithStatus = 200;

      await uploadDatasetFile({
        uploadUrl: `${baseUrl}/signed`,
        file: await csvFile(),
      });

      expect(received).toEqual({
        method: 'PUT',
        contentType: CONTENT_TYPE_BY_MIME_TYPE.CSV,
        body: 'a,b\n',
      });
    });

    it('should treat a non-2xx answer as a failed upload, not a success', async () => {
      respondWithStatus = 403;

      await expect(
        uploadDatasetFile({
          uploadUrl: `${baseUrl}/signed`,
          file: await csvFile(),
        }),
      ).rejects.toThrowError('The file upload failed with status 403.');
    });
  });
});

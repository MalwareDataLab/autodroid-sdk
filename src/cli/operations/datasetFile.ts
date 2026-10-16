import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { basename, extname } from 'node:path';

const CONTENT_TYPE_BY_MIME_TYPE = {
  CSV: 'text/csv',
  ZIP: 'application/zip',
  PDF: 'application/pdf',
  PNG: 'image/png',
  JPEG: 'image/jpeg',
  OTHER: 'application/octet-stream',
} as const;

type DatasetMimeType = keyof typeof CONTENT_TYPE_BY_MIME_TYPE;

const MIME_TYPE_BY_EXTENSION: Record<string, DatasetMimeType> = {
  '.csv': 'CSV',
  '.zip': 'ZIP',
  '.pdf': 'PDF',
  '.png': 'PNG',
  '.jpg': 'JPEG',
  '.jpeg': 'JPEG',
};

interface IDatasetFile {
  filename: string;
  size: number;
  md5_hash: string;
  mime_type: DatasetMimeType;
  content: Buffer;
}

const readDatasetFile = async (filePath: string): Promise<IDatasetFile> => {
  const content = await readFile(filePath);

  return {
    filename: basename(filePath),
    size: content.length,
    md5_hash: createHash('md5').update(content).digest('hex'),
    mime_type:
      MIME_TYPE_BY_EXTENSION[extname(filePath).toLowerCase()] ?? 'OTHER',
    content,
  };
};

const uploadDatasetFile = async (params: {
  uploadUrl: string;
  file: IDatasetFile;
}): Promise<void> => {
  const response = await fetch(params.uploadUrl, {
    method: 'PUT',
    redirect: 'follow',
    headers: {
      'Content-Type': CONTENT_TYPE_BY_MIME_TYPE[params.file.mime_type],
    },
    body: params.file.content,
  });

  if (!response.ok)
    throw new Error(`The file upload failed with status ${response.status}.`);
};

export { CONTENT_TYPE_BY_MIME_TYPE, readDatasetFile, uploadDatasetFile };

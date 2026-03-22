export enum FileFolderEnum {
  FINANCE_FILES = 'finances',
  APPLICATION = 'applications',
  DOCUMENT = 'documents',
}

export enum MIME_TYPE_MAP {
  'image/png' = 'png',
  'image/jpeg' = 'jpeg',
  'image/jpg' = 'jpg',
  'image/webp' = 'webp',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' = 'xlsx',
  'text/csv' = 'csv',
  'application/pdf' = 'pdf',
  'application/msword' = 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' = 'docx',
  'text/xml' = 'xml',
  'application/x-tar' = 'tar',
  'application/zip' = 'zip',
  'application/x-7z-compressed' = '7z',
  'application/x-rar-compressed' = 'rar',
  'application/x-gzip' = 'gz',
}

export const getMimeType = (mimetype: string) => {
  return (
    MIME_TYPE_MAP[mimetype as keyof typeof MIME_TYPE_MAP] ||
    'application/octet-stream'
  );
};

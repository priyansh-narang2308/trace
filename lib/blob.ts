import { put } from '@vercel/blob';

export async function uploadToBlob(file: File, filename: string) {
  try {
    const blob = await put(filename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return {
      url: blob.url,
      downloadUrl: blob.downloadUrl,
    };
  } catch (error) {
    console.error('Error uploading to blob:', error);
    throw new Error('Failed to upload file');
  }
}

export async function deleteFromBlob(url: string) {
  try {
    await put(url, new Blob(), {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
  } catch (error) {
    console.error('Error deleting from blob:', error);
    throw new Error('Failed to delete file');
  }
}

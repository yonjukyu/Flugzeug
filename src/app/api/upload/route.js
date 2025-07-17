// app/api/upload/route.js
import { BlobServiceClient } from '@azure/storage-blob';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('file');

  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const filename = file.name;

  const blobServiceClient = BlobServiceClient.fromConnectionString(
    `DefaultEndpointsProtocol=https;AccountName=${process.env.AZURE_STORAGE_ACCOUNT_NAME};AccountKey=${process.env.AZURE_STORAGE_ACCOUNT_KEY};EndpointSuffix=core.windows.net`
  );

  const containerClient = blobServiceClient.getContainerClient(process.env.SOURCE_CONTAINER);
  await containerClient.createIfNotExists();
  const blockBlobClient = containerClient.getBlockBlobClient(filename);
  await blockBlobClient.uploadData(buffer);

  return NextResponse.json({ message: 'File uploaded', filename });
}

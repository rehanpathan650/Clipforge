import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateBucketCommand,
  CreateMultipartUploadCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "node:fs";
import { stat } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import type { Readable } from "node:stream";
import { env } from "./env";

const common = {
  region: env.S3_REGION,
  forcePathStyle: env.S3_FORCE_PATH_STYLE,
  credentials: { accessKeyId: env.S3_ACCESS_KEY_ID, secretAccessKey: env.S3_SECRET_ACCESS_KEY },
  // Avoid default CRC32 checksums, which break presigned browser uploads on MinIO / R2.
  requestChecksumCalculation: "WHEN_REQUIRED" as const,
  responseChecksumValidation: "WHEN_REQUIRED" as const,
};

const s3 = new S3Client({ ...common, endpoint: env.S3_ENDPOINT });
/** Signs URLs with the endpoint the *browser* can reach. */
const signer = new S3Client({ ...common, endpoint: env.S3_PUBLIC_ENDPOINT ?? env.S3_ENDPOINT });
const Bucket = env.S3_BUCKET;

export const keys = {
  prefix: (projectId: string) => `projects/${projectId}/`,
  source: (projectId: string, ext: string) => `projects/${projectId}/source/original${ext}`,
  clip: (projectId: string, index: number, version: number) => `projects/${projectId}/clips/${index}-v${version}.mp4`,
  thumb: (projectId: string, index: number, version: number) => `projects/${projectId}/clips/${index}-v${version}.jpg`,
};

export async function initMultipart(key: string, contentType: string) {
  const res = await s3.send(new CreateMultipartUploadCommand({ Bucket, Key: key, ContentType: contentType }));
  if (!res.UploadId) throw new Error("Storage did not return an upload id");
  return res.UploadId;
}

export function presignParts(key: string, uploadId: string, partCount: number) {
  return Promise.all(
    Array.from({ length: partCount }, (_, i) =>
      getSignedUrl(
        signer,
        new UploadPartCommand({ Bucket, Key: key, UploadId: uploadId, PartNumber: i + 1 }),
        { expiresIn: 6 * 3600 },
      ),
    ),
  );
}

export async function completeMultipart(
  key: string,
  uploadId: string,
  parts: { partNumber: number; etag: string }[],
) {
  await s3.send(
    new CompleteMultipartUploadCommand({
      Bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: [...parts]
          .sort((a, b) => a.partNumber - b.partNumber)
          .map((p) => ({ PartNumber: p.partNumber, ETag: p.etag })),
      },
    }),
  );
}

export async function abortMultipart(key: string, uploadId: string) {
  await s3.send(new AbortMultipartUploadCommand({ Bucket, Key: key, UploadId: uploadId }));
}

export async function objectSize(key: string) {
  const head = await s3.send(new HeadObjectCommand({ Bucket, Key: key }));
  return head.ContentLength ?? 0;
}

export async function downloadToFile(key: string, dest: string) {
  const res = await s3.send(new GetObjectCommand({ Bucket, Key: key }));
  await pipeline(res.Body as Readable, fs.createWriteStream(dest));
}

export async function uploadFile(key: string, filePath: string, contentType: string) {
  const { size } = await stat(filePath);
  await s3.send(
    new PutObjectCommand({
      Bucket,
      Key: key,
      Body: fs.createReadStream(filePath),
      ContentLength: size,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

export function signedGetUrl(key: string, opts: { downloadName?: string; expiresIn?: number } = {}) {
  return getSignedUrl(
    signer,
    new GetObjectCommand({
      Bucket,
      Key: key,
      ...(opts.downloadName
        ? { ResponseContentDisposition: `attachment; filename="${opts.downloadName.replace(/[^\w.\- ]/g, "_")}"` }
        : {}),
    }),
    { expiresIn: opts.expiresIn ?? 3600 },
  );
}

export async function deletePrefix(prefix: string) {
  let token: string | undefined;
  do {
    const list = await s3.send(new ListObjectsV2Command({ Bucket, Prefix: prefix, ContinuationToken: token }));
    const objects = (list.Contents ?? []).map((o) => ({ Key: o.Key! }));
    if (objects.length) {
      await s3.send(new DeleteObjectsCommand({ Bucket, Delete: { Objects: objects, Quiet: true } }));
    }
    token = list.IsTruncated ? list.NextContinuationToken : undefined;
  } while (token);
}

export async function getObjectStream(key: string) {
  const res = await s3.send(new GetObjectCommand({ Bucket, Key: key }));
  return res.Body as Readable;
}

export async function deleteObjects(objectKeys: string[]) {
  const list = objectKeys.filter(Boolean);
  for (let i = 0; i < list.length; i += 1000) {
    await s3.send(
      new DeleteObjectsCommand({
        Bucket,
        Delete: { Objects: list.slice(i, i + 1000).map((Key) => ({ Key })), Quiet: true },
      }),
    );
  }
}

/**
 * Creates the bucket if it's missing, so local setup needs no extra tooling.
 * In production you create the bucket once yourself; failures here are logged, never fatal.
 */
export async function ensureBucket(): Promise<"exists" | "created"> {
  try {
    await s3.send(new HeadBucketCommand({ Bucket }));
    return "exists";
  } catch (err) {
    const status = (err as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode;
    if (status !== 404) throw err;
  }
  try {
    await s3.send(new CreateBucketCommand({ Bucket }));
    return "created";
  } catch (err) {
    // API and worker start together locally, so one of them may lose the race.
    const name = (err as { name?: string }).name;
    if (name === "BucketAlreadyOwnedByYou" || name === "BucketAlreadyExists") return "exists";
    throw err;
  }
}

import { api } from "./api";
import type { CaptionStyleId, Reframe } from "./types";

const CONCURRENCY = 3;
const RETRIES = 3;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface InitResponse {
  projectId: string;
  partSize: number;
  partUrls: string[];
}

function putPart(url: string, blob: Blob, onLoaded: (n: number) => void, signal?: AbortSignal): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.upload.onprogress = (e) => onLoaded(e.loaded);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const etag = xhr.getResponseHeader("ETag");
        if (etag) resolve(etag);
        else reject(new Error("Storage did not return an ETag. Allow the ETag header in the bucket's CORS rules."));
      } else reject(new Error(`Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new DOMException("Upload cancelled", "AbortError"));
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(blob);
  });
}

/**
 * Multipart upload straight from the browser to object storage.
 * The API never touches the bytes; parts upload in parallel and retry individually.
 */
export async function uploadFile(
  file: File,
  options: { captionStyle: CaptionStyleId; reframe: Reframe },
  onProgress: (fraction: number) => void,
  signal?: AbortSignal,
) {
  const init = await api.post<InitResponse>("/api/uploads/init", {
    filename: file.name,
    contentType: file.type || "video/mp4",
    size: file.size,
    ...options,
  });

  try {
    const { partSize, partUrls, projectId } = init;
    const loaded = new Array<number>(partUrls.length).fill(0);
    const parts: { partNumber: number; etag: string }[] = [];
    let next = 0;
    const report = () => onProgress(Math.min(1, loaded.reduce((a, b) => a + b, 0) / file.size));

    async function lane() {
      while (true) {
        const i = next++;
        if (i >= partUrls.length) return;
        const blob = file.slice(i * partSize, Math.min(file.size, (i + 1) * partSize));
        for (let attempt = 0; ; attempt++) {
          try {
            const etag = await putPart(partUrls[i]!, blob, (n) => ((loaded[i] = n), report()), signal);
            loaded[i] = blob.size;
            report();
            parts.push({ partNumber: i + 1, etag });
            break;
          } catch (e) {
            if (signal?.aborted || attempt >= RETRIES) throw e;
            loaded[i] = 0;
            await sleep(1000 * 2 ** attempt);
          }
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, partUrls.length) }, lane));

    parts.sort((a, b) => a.partNumber - b.partNumber);
    await api.post("/api/uploads/complete", { projectId, parts });
    return projectId;
  } catch (err) {
    await api.post("/api/uploads/abort", { projectId: init.projectId }).catch(() => undefined);
    throw err;
  }
}

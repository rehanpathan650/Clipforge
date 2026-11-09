import type { Clip, Project } from "@clipforge/core";
import { env, signedGetUrl } from "@clipforge/core";

export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "clip";

export function serializeSummary(p: Project & { _count?: { clips: number } }) {
  return {
    id: p.id,
    title: p.title,
    sourceType: p.sourceType,
    sourceUrl: p.sourceUrl,
    status: p.status,
    stage: p.stage,
    progress: p.progress,
    error: p.error,
    durationSec: p.durationSec,
    captionStyle: p.captionStyle,
    reframe: p.reframe,
    creditsCharged: p.creditsCharged,
    sourceAvailable: Boolean(p.sourceKey) && !p.sourceDeletedAt,
    createdAt: p.createdAt,
    expiresAt: new Date(p.createdAt.getTime() + env.CLIP_RETENTION_DAYS * 86_400_000),
    clipCount: p._count?.clips ?? 0,
  };
}

export async function serializeClip(c: Clip) {
  return {
    id: c.id,
    projectId: c.projectId,
    index: c.index,
    title: c.title,
    reason: c.reason,
    score: c.score,
    startSec: c.startSec,
    endSec: c.endSec,
    durationSec: c.endSec - c.startSec,
    status: c.status,
    error: c.error,
    captionStyle: c.captionStyle,
    reframe: c.reframe,
    version: c.version,
    videoUrl: await signedGetUrl(c.videoKey),
    downloadUrl: await signedGetUrl(c.videoKey, { downloadName: `${slug(c.title)}.mp4` }),
    thumbUrl: c.thumbKey ? await signedGetUrl(c.thumbKey) : null,
  };
}

export async function serializeProject(p: Project & { clips: Clip[] }) {
  const clips = await Promise.all(p.clips.map(serializeClip));
  return { ...serializeSummary(p), clipCount: clips.length, clips };
}

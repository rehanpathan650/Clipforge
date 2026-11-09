export type ProjectStatus =
  | "PENDING_UPLOAD"
  | "QUEUED"
  | "DOWNLOADING"
  | "TRANSCRIBING"
  | "ANALYZING"
  | "RENDERING"
  | "READY"
  | "FAILED";

export type CaptionStyleId = "karaoke" | "pop" | "boxed" | "clean";
export type Reframe = "auto" | "center";

export interface User {
  id: string;
  email: string;
  name: string | null;
  credits: number;
}

export interface ProjectSummary {
  id: string;
  title: string;
  sourceType: "UPLOAD" | "YOUTUBE";
  sourceUrl: string | null;
  status: ProjectStatus;
  stage: string;
  progress: number;
  error: string | null;
  durationSec: number | null;
  captionStyle: CaptionStyleId;
  reframe: Reframe;
  creditsCharged: number;
  sourceAvailable: boolean;
  createdAt: string;
  expiresAt: string;
  clipCount: number;
}

export interface Clip {
  id: string;
  projectId: string;
  index: number;
  title: string;
  reason: string;
  score: number;
  startSec: number;
  endSec: number;
  durationSec: number;
  status: "READY" | "RENDERING";
  error: string | null;
  captionStyle: CaptionStyleId;
  reframe: Reframe;
  version: number;
  videoUrl: string;
  downloadUrl: string;
  thumbUrl: string | null;
}

export interface Project extends ProjectSummary {
  clips: Clip[];
}

export interface Word {
  word: string;
  start: number;
  end: number;
}

export interface ClipDetail {
  clip: Clip;
  project: { id: string; title: string; durationSec: number | null; sourceAvailable: boolean };
  sourceUrl: string | null;
  words: Word[];
}

export interface ProgressEvent {
  projectId: string;
  status: ProjectStatus;
  stage: string;
  progress: number;
  error: string | null;
}

export interface Pack {
  id: string;
  name: string;
  credits: number;
  amountPaise: number;
  currency: string;
  minutes: number;
  blurb: string;
}

export interface LedgerEntry {
  id: string;
  delta: number;
  reason: "PURCHASE" | "USAGE" | "REFUND" | "BONUS";
  note: string | null;
  projectId: string | null;
  createdAt: string;
}

const ACTIVE: ProjectStatus[] = ["QUEUED", "DOWNLOADING", "TRANSCRIBING", "ANALYZING", "RENDERING"];
export const isActive = (s: ProjectStatus) => ACTIVE.includes(s);

export const STEPS: { status: ProjectStatus; label: string }[] = [
  { status: "DOWNLOADING", label: "Fetch video" },
  { status: "TRANSCRIBING", label: "Transcribe" },
  { status: "ANALYZING", label: "Find moments" },
  { status: "RENDERING", label: "Render clips" },
];

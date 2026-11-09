import { AudioLines, Crop, Download, Scissors, Sparkles, Subtitles, type LucideIcon } from "lucide-react";

export interface FeatureDeep {
  id: string;
  icon: LucideIcon;
  title: string;
  short: string;
  body: string;
  points: string[];
}

/** Six features used by the home grid (short) and /features (deep dive). All facts come from README / worker code. */
export const FEATURES: FeatureDeep[] = [
  {
    id: "transcription",
    icon: AudioLines,
    title: "Transcription with word timestamps",
    short: "Every word gets its own timestamp, so cuts land between words and captions stay in sync.",
    body: "Your audio is transcribed in chunks, which keeps long videos reliable. Each word keeps its start and end time. That timing drives where a clip begins and ends, and which word lights up in the captions.",
    points: ["Word-level timing, not just sentences", "Chunked processing for videos up to 2 hours", "The transcript is also what you click in the editor to set a trim point"],
  },
  {
    id: "moment-picking",
    icon: Sparkles,
    title: "AI moment picking with scores",
    short: "An AI editor reads the transcript, scores each candidate moment and cuts at sentence ends.",
    body: "ClipForge asks an AI editor to find strong openings and clear payoffs. Each pick gets a score and a short reason, so you can see why it was chosen. Picks are checked, snapped to word boundaries and de-duplicated before anything is rendered.",
    points: ["A score and a one-line reason for every clip", "Clips run 15 to 90 seconds", "No overlapping duplicates, no cuts mid-word"],
  },
  {
    id: "auto-framing",
    icon: Crop,
    title: "Auto-framing that follows the speaker",
    short: "Face detection and a smoothed virtual camera keep the speaker in a 9:16 frame.",
    body: "Landscape video is reframed to vertical with a virtual camera that follows the speaker's face and moves smoothly instead of jumping. It works best on front-facing talking heads. If you prefer, switch to a plain center crop per clip.",
    points: ["Follows the largest face in frame", "Smoothed camera path, no jitter", "Center-crop fallback whenever you want it"],
  },
  {
    id: "caption-styles",
    icon: Subtitles,
    title: "Four caption styles",
    short: "Karaoke, Pop, Boxed and Clean, burned into the video at 1080 × 1920.",
    body: "Captions are rendered into the MP4, so they look the same everywhere you post. Karaoke fills each word yellow as it is spoken. Pop shows one big word at a time. Boxed sits on a dark bar. Clean is plain white subtitles.",
    points: ["Word-by-word highlighting", "Switch style on any clip and re-render", "Burned in, no separate caption file to manage"],
  },
  {
    id: "editor",
    icon: Scissors,
    title: "Clip editor: trim, restyle, re-render",
    short: "Adjust a clip after the fact. Trim, change captions or framing, and re-render.",
    body: "Open any clip and trim it with the slider, the playhead or by clicking a word in the transcript. Change the caption style or framing, then re-render. Re-rendering a clip does not cost credits.",
    points: ["Trim by slider, playhead or transcript click", "Change caption style and framing", "Free re-renders while the source video is still stored"],
  },
  {
    id: "batch-download",
    icon: Download,
    title: "Download everything as a ZIP",
    short: "Grab a single clip, or download all of them in one ZIP.",
    body: "Each clip is a standard MP4 you can post straight to Reels, Shorts or TikTok. When a project finishes, download a single clip or the whole batch as one ZIP.",
    points: ["Per-clip MP4 downloads", "One ZIP for the whole project", "Vertical 1080 × 1920 output"],
  },
];

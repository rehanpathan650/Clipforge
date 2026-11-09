/** Release notes derived from the project's build phases. PLACEHOLDER: add real release dates. */
export interface Release {
  label: string;
  title: string;
  date: string | null;
  items: string[];
}

export const RELEASES: Release[] = [
  {
    label: "Phase 4",
    title: "Speaker tracking, caption styles and polish",
    date: null,
    items: ["Speaker-tracking reframing: face detection with a smoothed virtual camera", "Four caption styles: Karaoke, Pop, Boxed, Clean", "Hourly cleanup of abandoned uploads, stuck projects and expired sources"],
  },
  {
    label: "Phase 3",
    title: "Credits and payments",
    date: null,
    items: ["Credit packs: 1 credit = 1 minute of source video", "Automatic credit refunds when processing fails", "Checkout with server-side payment verification"],
  },
  {
    label: "Phase 2",
    title: "Dashboard and clip editor",
    date: null,
    items: ["Live progress while a video processes", "Clip editor: trim by slider, playhead or transcript click", "Change captions and framing, then re-render", "Per-clip downloads and a download-all ZIP"],
  },
  {
    label: "Phase 1",
    title: "Core pipeline",
    date: null,
    items: ["Direct-to-storage uploads and YouTube links", "Word-timestamp transcription", "AI-picked, scored moments snapped to word boundaries", "1080 × 1920 rendering with captions"],
  },
];

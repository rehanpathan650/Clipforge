export const STEPS = [
  {
    title: "Add your video",
    body: "Upload a file or paste a YouTube link. Videos can run up to two hours.",
    detail: ["Files up to 2 GB upload straight to storage in parts, so big files are fine", "Pick a caption style and framing before you start, or change them later", "Credits are charged per started minute of source video when processing begins"],
  },
  {
    title: "We transcribe it",
    body: "Every word is turned into text with its own timestamp, so cuts land exactly between words.",
    detail: ["Audio is transcribed in chunks to keep long videos reliable", "Word-level timing drives both the cuts and the caption highlighting", "Clear speech gives the best picks"],
  },
  {
    title: "We pick the moments",
    body: "An AI editor looks for strong openings and clear payoffs, scores each one, and cuts at the end of a sentence.",
    detail: ["Each pick has a score and a short reason", "Clips are 15 to 90 seconds, snapped to word boundaries", "Overlapping duplicates are removed"],
  },
  {
    title: "You download the clips",
    body: "Each clip is vertical, 1080 by 1920, with captions that fill in word by word. Download it and post.",
    detail: ["Speaker-tracking reframing, or center crop if you prefer", "Trim, restyle and re-render any clip in the editor", "Download one clip or everything as a ZIP"],
  },
];

export const SPECS: [string, string][] = [
  ["Output", "MP4, 1080 × 1920 (9:16)"],
  ["Clip length", "15 to 90 seconds"],
  ["Captions", "Burned in, highlighted word by word"],
  ["Caption styles", "Karaoke, Pop, Boxed, Clean"],
  ["Sources", "File upload up to 2 GB, or a YouTube link"],
  ["Video length", "Up to 120 minutes"],
  ["Framing", "Speaker tracking or center crop"],
  ["Billing", "1 credit per started minute of source video"],
];

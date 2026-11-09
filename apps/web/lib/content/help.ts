export interface HelpArticle {
  id: string;
  title: string;
  category: "Getting started" | "Clips" | "Credits & billing" | "Troubleshooting";
  body: string;
}

export const HELP: HelpArticle[] = [
  { id: "first-project", category: "Getting started", title: "Create your first project", body: "Sign up, then choose Upload or paste a YouTube link. Pick a caption style and start. Progress updates live on the project page. Short test clips of 3 to 5 minutes with clear speech work best for a first try." },
  { id: "supported-videos", category: "Getting started", title: "What videos can I use?", body: "Files up to 2 GB and videos up to 120 minutes. Videos need clear speech, because moments are picked from the transcript. Only use videos you own or have permission to use." },
  { id: "youtube-links", category: "Troubleshooting", title: "My YouTube link failed", body: "YouTube can block automated downloads, and its terms may restrict downloading. If a link fails, download the video yourself where you're allowed to, and upload the file instead. Credits for failed runs are refunded." },
  { id: "credits", category: "Credits & billing", title: "How credits work", body: "One credit is one minute of source video, billed per started minute with a minimum of one. Credits are charged when processing starts and don't expire." },
  { id: "refunds-failed", category: "Credits & billing", title: "What if processing fails?", body: "Credits for a failed run are returned to your balance automatically. Projects that make no progress for several hours are marked failed and refunded." },
  { id: "caption-styles", category: "Clips", title: "Choosing a caption style", body: "Karaoke fills words yellow as they're spoken. Pop shows one large word at a time. Boxed puts text on a dark bar. Clean is plain white subtitles. You can change the style per clip in the editor." },
  { id: "editor", category: "Clips", title: "Trim and re-render a clip", body: "Open a clip, then trim with the slider, the playhead or by clicking a word in the transcript. Change the caption style or framing and re-render. Re-renders don't cost credits while the source video is stored." },
  { id: "framing", category: "Clips", title: "Speaker tracking and center crop", body: "Auto framing follows the largest face with a smoothed camera. It works best on front-facing talking heads. For shots with several people or no faces, use center crop." },
  { id: "downloads", category: "Clips", title: "Download clips", body: "Download any clip as an MP4, or use download all for a ZIP of the whole project." },
  { id: "retention", category: "Troubleshooting", title: "Why can't I edit an old project?", body: "Source videos are removed after a retention period. After that, clips can still be downloaded until the project expires, but editing and re-rendering are disabled." },
];

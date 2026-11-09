export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readMinutes: number;
  /** PLACEHOLDER: replace with real publish dates. */
  date: string | null;
  body: { h?: string; p: string }[];
}

export const POSTS: Post[] = [
  {
    slug: "how-clipforge-picks-moments",
    title: "How ClipForge picks moments from a long video",
    excerpt: "From word timestamps to a scored list of clips: what happens between your upload and your download.",
    category: "Product",
    readMinutes: 4,
    date: null,
    body: [
      { p: "A clip that works usually has two things: an opening that makes someone stop scrolling and an ending that pays it off. ClipForge looks for both in the transcript of your video." },
      { h: "Start with words, not frames", p: "Your audio is transcribed in chunks, and every word keeps its own start and end time. Chunking keeps long videos reliable, and word timing is what lets a cut land between two words instead of through one." },
      { h: "Ask for scored candidates", p: "An AI editor reads the transcript and proposes moments with a score and a short reason. Those proposals are then checked: clips must be 15 to 90 seconds, boundaries snap to word edges, and overlapping duplicates are removed." },
      { h: "Frame, caption, render", p: "Each accepted moment is reframed to 9:16 with a smoothed virtual camera, captions are burned in word by word, and the clip is rendered at 1080 × 1920." },
      { h: "Then it's yours to adjust", p: "Open any clip in the editor to trim it, change the caption style or switch the framing. Re-rendering doesn't cost credits." },
    ],
  },
];

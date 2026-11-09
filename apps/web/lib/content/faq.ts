import type { QA } from "@/components/marketing/ui/Accordion";

export const FAQ: QA[] = [
  { q: "How does pricing work?", a: "You buy a credit pack. One credit covers one minute of source video, billed per started minute. There is no subscription, and credits don't expire." },
  { q: "What happens if a video fails to process?", a: "The credits for that run are refunded automatically. Projects that stall for too long are marked failed and refunded too." },
  { q: "How long can my video be?", a: "Up to 2 hours. File uploads can be up to 2 GB. Clips come out between 15 and 90 seconds." },
  { q: "Can I paste a YouTube link?", a: "Yes. Downloading from YouTube can be blocked on our side, and YouTube's terms may restrict it. When a link fails we tell you clearly, and uploading the file always works." },
  { q: "What do the clips look like?", a: "Vertical 1080 × 1920 MP4 with captions burned in. Pick Karaoke, Pop, Boxed or Clean, and change it later in the editor." },
  { q: "Does it follow the speaker?", a: "It keeps the largest detected face in frame with a smoothed camera. That suits talking heads. In a shot with several people it does not pick the active speaker, and you can switch any clip to a center crop." },
  { q: "Can I edit a clip after it's made?", a: "Yes. Trim it, change the caption style or framing, and re-render. Re-rendering doesn't use credits while the source video is still stored." },
  { q: "Whose videos can I use?", a: "Only videos you own or have permission to use. Our terms cover takedown requests and repeat infringement." },
];

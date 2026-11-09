import { Layers, Mic, Repeat, Users, Video, Wand2, type LucideIcon } from "lucide-react";

export interface Solution {
  slug: "podcasters" | "creators" | "agencies";
  label: string;
  eyebrow: string;
  title: string;
  sub: string;
  meta: string;
  summary: string; // short text for tabs
  pains: { title: string; body: string }[];
  workflow: string[];
  benefits: { icon: LucideIcon; title: string; body: string }[];
  faq: { q: string; a: string }[];
}

export const SOLUTIONS: Solution[] = [
  {
    slug: "podcasters",
    label: "Podcasters",
    eyebrow: "For podcasters",
    title: "Turn every episode into shorts people can watch without sound",
    sub: "Upload the episode or paste a link. ClipForge finds the quotable moments and delivers captioned vertical clips.",
    meta: "Turn long podcast episodes into captioned vertical clips for Reels, Shorts and TikTok. Pay per minute of source video.",
    summary: "Long episodes, up to two hours, become a batch of captioned clips with the best exchanges cut at sentence ends.",
    pains: [
      { title: "Finding the moment takes longer than the recording", body: "Scrubbing a 90-minute episode for a 40-second clip is a job nobody wants." },
      { title: "Clips without captions don't get watched", body: "Most people scroll with sound off. Captions need to be in the video itself." },
      { title: "Two people on camera is awkward in 9:16", body: "A fixed crop cuts someone off. Reframing by hand is slow." },
    ],
    workflow: ["Upload the episode or paste a link", "Pick a caption style", "Review the scored picks and download", "Trim any clip in the editor if you want a tighter cut"],
    benefits: [
      { icon: Mic, title: "Built for speech", body: "Picks come from the transcript, so they follow how people actually talk: a question, then the answer." },
      { icon: Wand2, title: "Captions that follow the voice", body: "Karaoke style highlights each word as it's spoken." },
      { icon: Video, title: "Up to 2 hours per episode", body: "Full-length episodes fit in a single project." },
    ],
    faq: [
      { q: "Does it work with audio-only podcasts?", a: "ClipForge works from video files. If your episode is a video recording, it works. Audio-only files aren't supported." },
      { q: "Who does the camera follow in a two-person shot?", a: "It follows the largest face in frame. For interview setups, a center crop or a manual trim in the editor may suit better." },
    ],
  },
  {
    slug: "creators",
    label: "Creators",
    eyebrow: "For creators",
    title: "One long video, a week of shorts",
    sub: "Film once. ClipForge cuts the strongest moments into vertical clips so your long-form work keeps feeding your short-form feed.",
    meta: "Cut long-form YouTube videos into captioned vertical shorts. Credits per minute of source video, no subscription.",
    summary: "Turn a long-form upload into several vertical clips, each with a score and a reason for why it was picked.",
    pains: [
      { title: "Long-form takes all your time", body: "Editing shorts by hand on top of the main video rarely happens." },
      { title: "Hard to know which moment will land", body: "A second opinion on where the hook is saves guesswork." },
      { title: "Every platform wants vertical", body: "Reels, Shorts and TikTok all want 9:16 with captions." },
    ],
    workflow: ["Paste your YouTube link or upload the file", "Choose a caption style", "Download the clips you like", "Restyle or trim the rest"],
    benefits: [
      { icon: Repeat, title: "Reuse what you already made", body: "Your back catalog is a source of clips too." },
      { icon: Wand2, title: "Scores and reasons", body: "See why each moment was picked before you post it." },
      { icon: Layers, title: "Credits don't expire", body: "Buy a pack, use it when you publish." },
    ],
    faq: [
      { q: "Can I use videos that aren't mine?", a: "Only content you own or have permission to use." },
      { q: "What if my YouTube link fails?", a: "Uploading the file always works. YouTube can block downloads from our servers." },
    ],
  },
  {
    slug: "agencies",
    label: "Agencies",
    eyebrow: "For agencies",
    title: "Clip client content without an editor in the loop",
    sub: "Run client footage through the same pipeline every time, review the picks, and hand over finished vertical clips.",
    meta: "Produce captioned vertical clips from client video at volume. Credit packs priced per minute of source video.",
    summary: "A repeatable pipeline: upload client footage, pick a caption style, download the batch as a ZIP.",
    pains: [
      { title: "Short-form for every client adds up", body: "Manual editing doesn't scale with the number of accounts." },
      { title: "Consistency matters", body: "The same caption style across a client's clips is part of their look." },
      { title: "Revisions eat time", body: "A trim or a restyle shouldn't mean starting over." },
    ],
    workflow: ["Upload the client's long-form footage", "Set the caption style for that client", "Download all clips as one ZIP", "Re-render individual clips after feedback"],
    benefits: [
      { icon: Users, title: "Predictable cost", body: "One credit per minute of source video. The Studio pack is built for volume." },
      { icon: Layers, title: "Batch download", body: "A single ZIP per project." },
      { icon: Wand2, title: "Free re-renders", body: "Handle client feedback without spending credits again." },
    ],
    faq: [
      { q: "Is there a team or client workspace feature?", a: "Not yet. Accounts are individual today. If shared workspaces matter to you, tell us through the contact page." },
      { q: "Do I need the client's permission?", a: "Yes. Only process footage you own or are authorized to use." },
    ],
  },
];

export const getSolution = (slug: string) => SOLUTIONS.find((s) => s.slug === slug);

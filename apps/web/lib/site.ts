export const SITE = {
  name: "ClipForge",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://clipforge.example.com",
  tagline: "Long videos in, short clips out.",
  description:
    "Upload a video or paste a YouTube link. ClipForge finds the best moments and delivers vertical 1080×1920 clips with word-by-word captions.",
  supportEmail: "support@clipforge.example.com",
  consent: "Only upload or link videos you own or have permission to use.",
} as const;

export interface NavLink {
  label: string;
  href: string;
  note?: string;
}
export interface NavGroup {
  label: string;
  items: NavLink[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Product",
    items: [
      { label: "Features", href: "/features", note: "Transcription, moment picking, editor" },
      { label: "Caption styles", href: "/showcase#caption-styles", note: "Karaoke, Pop, Boxed, Clean" },
      { label: "Speaker tracking", href: "/features#auto-framing", note: "Keeps the speaker in frame" },
    ],
  },
  {
    label: "Solutions",
    items: [
      { label: "Podcasters", href: "/solutions/podcasters", note: "Episodes into shorts" },
      { label: "Creators", href: "/solutions/creators", note: "Long-form into a week of posts" },
      { label: "Agencies", href: "/solutions/agencies", note: "Clip for clients at volume" },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Blog", href: "/blog", note: "Guides and notes" },
      { label: "Help center", href: "/help", note: "Answers to common questions" },
      { label: "Changelog", href: "/changelog", note: "What shipped and when" },
    ],
  },
];

export const NAV_TOP: NavLink[] = [{ label: "Pricing", href: "/pricing" }];

export const FOOTER_COLUMNS: NavGroup[] = [
  {
    label: "Product",
    items: [
      { label: "Features", href: "/features" },
      { label: "How it works", href: "/how-it-works" },
      { label: "Examples", href: "/showcase" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    label: "Solutions",
    items: [
      { label: "Podcasters", href: "/solutions/podcasters" },
      { label: "Creators", href: "/solutions/creators" },
      { label: "Agencies", href: "/solutions/agencies" },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Blog", href: "/blog" },
      { label: "Help center", href: "/help" },
      { label: "FAQ", href: "/faq" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    label: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Log in", href: "/login" },
      { label: "Sign up", href: "/signup" },
    ],
  },
  {
    label: "Legal",
    items: [
      { label: "Terms of service", href: "/terms" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Refunds & cancellation", href: "/refund-policy" },
    ],
  },
];

/** Facts that exist in the codebase (README / worker). Reused across pages. */
export const FACTS = {
  output: "1080 × 1920 MP4",
  clipLength: "15 to 90 seconds",
  maxVideo: "up to 2 hours",
  maxFile: "2 GB",
} as const;

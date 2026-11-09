import type { LegalSection } from "@/components/marketing/ui/LegalLayout";

/*
 * DRAFT – REVIEW WITH A LAWYER BEFORE LAUNCH.
 * Sensible starting text written from what the product does (README). It is not legal advice.
 * Items needing a decision are marked "[...]" and listed in the hand-off summary:
 *   governing law/jurisdiction, legal entity name and address, cash-refund window, retention periods, data processors.
 */

export const LEGAL_UPDATED = "[Date to be set at launch]";

export const TERMS: LegalSection[] = [
  { id: "acceptance", title: "1. Agreeing to these terms", body: ["By creating an account or using ClipForge you agree to these terms. If you don't agree, don't use the service."] },
  { id: "service", title: "2. What ClipForge does", body: ["ClipForge turns long videos you upload or link into short vertical clips with captions. It transcribes your video, uses AI to propose moments, and renders clips you can download.", "AI picks are suggestions. You are responsible for reviewing clips before you publish them."] },
  {
    id: "content",
    title: "3. Your content and permission to use it",
    body: [
      "You keep ownership of your videos and the clips made from them. You give us the limited right to store, process and render them to provide the service.",
      "Only upload or link videos you own or have permission to use. You are responsible for having the rights needed for everything you submit.",
      "- Do not submit content that infringes someone else's rights, is unlawful, or exploits or endangers minors.",
      "- YouTube links: downloading may be restricted by YouTube's own terms. You are responsible for linking only videos you are allowed to download and process.",
    ],
  },
  { id: "copyright", title: "4. Copyright complaints", body: ["If you believe content processed through ClipForge infringes your copyright, email us at the support address on the contact page with the work, where it appears and your contact details. We will review it and may remove content.", "We may suspend or close the accounts of people who repeatedly infringe."] },
  { id: "credits", title: "5. Credits and payment", body: ["Credits are sold in one-off packs. One credit covers one minute of source video, billed per started minute with a minimum of one. Credits are charged when processing starts and do not expire.", "If processing fails, the credits for that run are returned to your balance. Prices are shown on the pricing page and may change for future purchases."] },
  { id: "acceptable-use", title: "6. Acceptable use", body: ["Don't misuse the service. That includes attempting to break or overload it, reverse engineer it, resell access without our written permission, or circumvent usage limits."] },
  { id: "availability", title: "7. Availability and changes", body: ["We work to keep ClipForge running but don't promise it will always be available or error-free. Source videos and clips are kept for a limited time and then deleted, so download what you want to keep.", "We may change or discontinue features. If we make a material change to these terms we will update this page."] },
  { id: "liability", title: "8. Liability", body: ["The service is provided as is. To the extent the law allows, we are not liable for indirect or consequential loss, and our total liability for any claim is limited to the amount you paid us in the 12 months before it arose."] },
  { id: "termination", title: "9. Ending your account", body: ["You can stop using ClipForge at any time. We may suspend or close accounts that break these terms. See the refunds and cancellation policy for what happens to unused credits."] },
  { id: "law", title: "10. Governing law and contact", body: ["These terms are governed by the laws of [jurisdiction]. Questions about them can be sent through the contact page."] },
];

export const PRIVACY: LegalSection[] = [
  { id: "overview", title: "1. Overview", body: ["This policy explains what ClipForge collects, why, and the choices you have. We collect what we need to run the service and nothing more."] },
  {
    id: "collect",
    title: "2. What we collect",
    body: [
      "- Account details: your email, a hashed password, and an optional name.",
      "- Content you submit: videos you upload or link, the transcripts we generate, and the clips we render.",
      "- Billing records: credit purchases and usage. Card and UPI details are handled by our payment provider, not stored by us.",
      "- Technical data: session cookies, logs and error reports needed to keep the service secure and working.",
    ],
  },
  { id: "use", title: "3. How we use it", body: ["To provide and secure the service, process payments, prevent abuse, fix errors and answer your messages. We don't sell your personal data."] },
  { id: "processors", title: "4. Who processes your data", body: ["To provide the service we send data to infrastructure and AI providers: cloud storage, a speech-to-text provider that receives your audio, an AI model provider that receives your transcript, and a payment provider. [Name each provider before launch.]"] },
  { id: "cookies", title: "5. Cookies", body: ["We use a strictly necessary session cookie to keep you signed in. We don't use advertising cookies on this site."] },
  { id: "retention", title: "6. How long we keep things", body: ["Source videos are deleted after a retention period, and projects with their clips are deleted after a longer one. Abandoned uploads and expired sessions are cleaned up automatically. [State the exact periods before launch.]"] },
  { id: "rights", title: "7. Your choices", body: ["You can ask to access, correct or delete your data by contacting us. Deleting projects removes the associated videos and clips."] },
  { id: "security", title: "8. Security", body: ["Passwords are hashed, sessions are stored server-side, and payments are verified on the server. No system is perfectly secure, but we take reasonable care."] },
  { id: "contact", title: "9. Contact", body: ["Privacy questions can be sent through the contact page."] },
];

export const REFUND: LegalSection[] = [
  { id: "failures", title: "1. Failed processing: automatic refund", body: ["If a video can't be processed, the credits for that run are returned to your balance automatically. If a project stalls without progress for too long, it's marked failed and refunded.", "You don't need to ask."] },
  { id: "rerender", title: "2. Re-renders", body: ["Re-rendering a clip after trimming or restyling doesn't use credits while the source video is still stored."] },
  { id: "unused", title: "3. Unused credits", body: ["Credits don't expire. They stay in your account until you use them."] },
  { id: "cash", title: "4. Refunds for purchases", body: ["Credit packs are one-off purchases. If you bought a pack by mistake or something went wrong with a payment, email us with your order details and we'll review it. [Decide and state your cash-refund window and conditions.]"] },
  { id: "cancellation", title: "5. Cancellation", body: ["ClipForge has no subscription, so there is nothing to cancel and nothing renews. You can stop using the service at any time, and you can ask us to delete your account."] },
  { id: "contact", title: "6. How to reach us", body: ["Use the contact page and include the email on your account."] },
];

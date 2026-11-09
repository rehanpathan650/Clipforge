# ClipForge

Long video in, short vertical clips out. Users sign up, buy credits, upload a file or paste a YouTube link, and get 9:16 MP4 clips with captions burned in. Clips can be trimmed, restyled and re-framed in an editor.

```
Browser ──multipart upload──▶ S3 / R2 / MinIO
   │ \                              ▲
   │  └─ REST + SSE + cookies ─▶ API (Express) ──enqueue──▶ Redis (BullMQ) ──▶ Worker(s)
   ▼                               │                                          │ yt-dlp · ffmpeg · OpenCV
 Next.js ◀── Razorpay Checkout     ▼                                          │ Whisper API · Claude
   │            │ webhook ──▶   Postgres ◀──── progress, credits, clips ───────┘
```

| Path | What it is |
| --- | --- |
| `apps/web` | Next.js 15 · Tailwind · GSAP (landing) · Framer Motion (app) |
| `apps/api` | Express 5: auth, uploads, projects, clips, billing, Razorpay webhook, SSE, metrics |
| `apps/worker` | BullMQ workers: pipeline, clip re-render, hourly maintenance. ffmpeg + OpenCV tracking |
| `packages/core` | Prisma schema, env validation, S3 helpers, auth, credit ledger, billing, queue, metrics |
| `deploy/` | Production docker-compose + Caddy (automatic HTTPS) |
| `loadtest/` | k6 script |

## What's in each phase

1. **Core pipeline.** Direct-to-storage multipart upload, BullMQ queue, chunked Whisper transcription with word timestamps, Claude picks scored moments (validated, snapped to word boundaries, de-duplicated), ffmpeg renders 1080×1920 with captions.
2. **Product.** Email/password auth (scrypt, DB-backed httpOnly sessions), dashboard with live progress over SSE, clip editor (trim by slider, playhead or transcript click; change captions and framing; free re-render), per-clip downloads and a "download all" ZIP.
3. **Money.** 1 credit = 1 minute of source video. Append-only credit ledger with idempotency keys, atomic debit (balance can't go negative), automatic refunds on failure, Razorpay Checkout with server-side payment verification and signed webhooks, concurrency and rate limits.
4. **Polish and hardening.** Speaker-tracking reframing (face detection → smoothed virtual camera), four caption styles, animated landing page with pricing, Prometheus metrics, optional Sentry, liveness/readiness probes, hourly cleanup jobs, k6 load test, unit tests, CI, production compose.

---

## Install and run locally

**You need:** Node 20+, Docker Desktop (running), ffmpeg, yt-dlp, and Python 3 with OpenCV for speaker tracking.

```bash
# macOS
brew install ffmpeg yt-dlp python
pip3 install opencv-python-headless
# Ubuntu / WSL
sudo apt install ffmpeg python3-pip fonts-dejavu-core && pip3 install -U "yt-dlp[default]" opencv-python-headless
# Windows: winget install Gyan.FFmpeg yt-dlp.yt-dlp  (then install Python and run the pip command)
```

Check: `ffmpeg -version`, `yt-dlp --version`, `python3 -c "import cv2; print(cv2.__version__)"`. Without OpenCV everything still works; framing just falls back to a centre crop.

**Get two API keys:** a Whisper key from console.groq.com (free tier) and an Anthropic key from console.anthropic.com.

```bash
cp .env.example .env                           # fill in TRANSCRIBE_API_KEY and ANTHROPIC_API_KEY
cp apps/web/.env.local.example apps/web/.env.local
npm install
npm run infra                                  # Postgres, Redis and a local S3 (MinIO fork) in Docker; wait ~10 s
npm run db:migrate -- --name init              # creates tables; commit the generated prisma/migrations folder
npm run dev                                    # web :3000 · api :4000 · worker (metrics :9100)
```

Open http://localhost:3000 → **Sign up**. New accounts get `SIGNUP_BONUS_CREDITS` (30 in `.env.example`), so you can test without Razorpay. Upload a video that is at least 30 s long and has speech. Start with 3–5 minutes.

> Upgrading from the Phase 1 zip? The schema changed a lot. For a dev database, reset it: `docker compose down -v`, then `npm run infra` and `npm run db:migrate -- --name init`.

### Testing payments (Razorpay test mode)

1. Create a Razorpay account and copy the **test** Key Id and Key Secret into `.env` (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`). Restart the API.
2. For webhooks locally, expose the API (`ngrok http 4000`), then in Razorpay → Settings → Webhooks add `https://<tunnel>/api/webhooks/razorpay`, enable **payment.captured** and **order.paid**, set a secret and put it in `RAZORPAY_WEBHOOK_SECRET`.
3. Go to **Credits** → Buy → pay with Razorpay's test card/UPI. Credits appear within seconds (browser callback, with the webhook as safety net).

Prices live in `packages/core/src/pricing.ts` (placeholders). Set them from your measured cost per video hour, and mirror them in the `FALLBACK_PACKS` list in `apps/web/lib/packs.ts`.

---

## Deploy to production

Target: one Linux VPS (4+ vCPU recommended) with Docker, a domain, **managed Postgres** (Neon, RDS, Supabase) and **Cloudflare R2 or S3** for storage.

1. **DNS:** point `app.example.com` and `api.example.com` at the server.
2. **Storage:** create a bucket, an access key, and this CORS rule (browser uploads need `ETag` exposed). Add a lifecycle rule to abort incomplete multipart uploads after 1 day.
   ```json
   [{"AllowedOrigins":["https://app.example.com"],"AllowedMethods":["PUT","GET"],"AllowedHeaders":["*"],"ExposeHeaders":["ETag"],"MaxAgeSeconds":3600}]
   ```
3. **Config:** copy `.env.example` to `.env.production` and set at least:
   `NODE_ENV=production`, `DATABASE_URL`, `S3_*` (and `S3_FORCE_PATH_STYLE=false` for AWS S3), `WEB_ORIGIN=https://app.example.com`, `COOKIE_DOMAIN=.example.com`, `SIGNUP_BONUS_CREDITS=0` (or your trial size), Razorpay **live** keys, `TRANSCRIBE_API_KEY`, `ANTHROPIC_API_KEY`, `METRICS_TOKEN`, optionally `SENTRY_DSN`. Also export `APP_DOMAIN` and `API_DOMAIN` for compose.
4. **Run:**
   ```bash
   export APP_DOMAIN=app.example.com API_DOMAIN=api.example.com
   docker compose -f deploy/docker-compose.prod.yml --env-file .env.production up -d --build
   ```
   Migrations run automatically (`migrate` service). Caddy gets HTTPS certificates by itself.
5. **Razorpay live webhook:** `https://api.example.com/api/webhooks/razorpay` with `payment.captured` and `order.paid`.
6. **Scale:** raise `deploy.replicas` for `worker` (about one per 2–4 vCPU). The API is stateless.

The web app and API must share a cookie domain (subdomains of one site); that is what `COOKIE_DOMAIN` is for.

---

## Operations

- **Probes:** `GET /healthz` (process up), `GET /readyz` (Postgres + Redis reachable).
- **Metrics (Prometheus):** API `GET /metrics` and worker `:9100/metrics`, both with `Authorization: Bearer $METRICS_TOKEN`. Disabled in production if no token is set. Series: HTTP latency by route, job duration/outcome, queue depth, credits spent. Suggested alerts: queue `waiting` growing for 10+ min, job error ratio above 10%, p95 latency above 1 s, `/readyz` failing.
- **Errors:** set `SENTRY_DSN` to report unexpected API errors and final worker failures.
- **Cleanup jobs** (hourly, in the worker): abandoned uploads (>24 h), stuck projects (>3 h without progress → failed and refunded), source videos after `SOURCE_RETENTION_DAYS` (editing is disabled after that), whole projects after `CLIP_RETENTION_DAYS`, expired sessions.
- **Load test:** on staging with `RATE_LIMIT_GLOBAL=1000000`, run `k6 run -e API_URL=https://api.staging.example.com loadtest/api.js`. It exercises auth, project list and billing reads (target p95 < 500 ms). Test worker throughput separately by submitting several videos at once and watching queue depth and job duration.
- **Tests:** `npm test --workspaces --if-present` (billing signatures, credit maths, caption generation, camera-path maths). `npm run typecheck`.
- **Billing safety:** every ledger row has a unique key (`usage:<project>:<run>`, `refund:…`, `purchase:…`), so retries, double webhooks and double clicks can't double-charge or double-credit.

## Before you launch

- Write real **Terms of Service and Privacy Policy**, with a copyright/DMCA takedown process and a repeat-infringer policy. Users will clip other people's content.
- **YouTube links:** downloading can violate YouTube's Terms, and datacenter IPs get blocked. The worker reports blocks clearly and asks users to upload. Keep uploads as the primary path.
- **Not included:** email verification, password reset and social login (add Resend/Postmark and Google OAuth), subscriptions (only one-off packs), refunds UI, admin dashboard, GST invoices, and end-to-end tests.
- **Known limits:** speaker tracking uses OpenCV's Haar face detector, which is fast but best on front-facing talking heads. It follows the largest face, so it doesn't pick the active speaker in a multi-person shot. The editor's centre-crop guide is approximate for non-16:9 sources. Credits don't expire.
- **Verify first:** the code type-checks syntactically and the pure logic is unit-tested, but the full stack hasn't been run end to end. Test a short video, a YouTube link, a re-render, a failed job (refund) and a test payment before charging real money.

## Troubleshooting

- *`pull access denied for minio/minio` or `minio/mc`*: MinIO removed those images from Docker Hub in 2026. This project uses the `pgsty/minio` fork instead; make sure you have the latest zip. The bucket is created automatically by the app.
- *Upload fails with "did not return an ETag"*: bucket CORS must expose `ETag`.
- *Redirected to /login in a loop in production*: `COOKIE_DOMAIN` is missing or the web and API aren't on the same parent domain.
- *Worker exits at start*: `TRANSCRIBE_API_KEY` or `ANTHROPIC_API_KEY` is missing.
- *"Payments aren't configured"*: add the Razorpay keys and restart the API.
- *yt-dlp errors about a JavaScript runtime*: upgrade yt-dlp and install Deno or Node.
- *Wrong caption font*: install a bold sans font on the worker or change `font` in `apps/worker/src/lib/captionStyles.ts`.

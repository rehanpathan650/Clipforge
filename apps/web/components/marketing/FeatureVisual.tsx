import { SpeakerTrackingVisual } from "./SpeakerTracking";
import { cx } from "./ui/cx";

const Panel = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div aria-hidden="true" className={cx("rounded-card border border-white/10 bg-surface p-5 sm:p-6", className)}>
    {children}
  </div>
);

const WORDS: [string, string][] = [["So", "0:12.4"], ["the", "0:12.6"], ["catch", "0:12.8"], ["is", "0:13.1"], ["nobody", "0:13.3"], ["tells", "0:13.7"], ["you", "0:13.9"]];

/** Static, illustrative mini-UIs for the /features deep dive. Content is decorative and clearly generic. */
export function FeatureVisual({ id }: { id: string }) {
  switch (id) {
    case "transcription":
      return (
        <Panel>
          <p className="mb-3 font-mono text-xs text-fg-subtle">transcript · word timestamps</p>
          <div className="flex flex-wrap gap-2">
            {WORDS.map(([w, t]) => (
              <span key={t} className="rounded-lg bg-surface-2 px-2.5 py-1.5 text-sm">
                {w}
                <span className="ml-1.5 font-mono text-[0.65rem] text-caption">{t}</span>
              </span>
            ))}
          </div>
        </Panel>
      );
    case "moment-picking":
      return (
        <Panel>
          <p className="mb-3 font-mono text-xs text-fg-subtle">picked moments</p>
          {[
            ["Strong opening, clear payoff", 92, "0:34"],
            ["A question with a direct answer", 81, "0:48"],
            ["Story with a surprise ending", 74, "0:27"],
          ].map(([r, s, d]) => (
            <div key={String(r)} className="mb-2 flex items-center gap-3 rounded-xl bg-surface-2 px-4 py-3 last:mb-0">
              <span className="font-mono text-lg text-caption">{s}</span>
              <span className="flex-1 text-sm text-fg-muted">{r}</span>
              <span className="font-mono text-xs text-fg-subtle">{d}</span>
            </div>
          ))}
          <p className="mt-3 text-xs text-fg-subtle">Illustrative example</p>
        </Panel>
      );
    case "auto-framing":
      return <SpeakerTrackingVisual />;
    case "caption-styles":
      return (
        <Panel className="grid grid-cols-2 gap-3">
          {[
            ["Karaoke", "text-caption"],
            ["Pop", "text-caption text-2xl"],
            ["Boxed", "bg-ink px-2 text-white"],
            ["Clean", "font-medium text-white"],
          ].map(([n, c]) => (
            <div key={n} className="grid aspect-video place-items-center rounded-xl bg-gradient-to-br from-[#2a3ad0] to-[#0b1033]">
              <span className={cx("rounded font-display text-lg font-extrabold", c)}>{n}</span>
            </div>
          ))}
        </Panel>
      );
    case "editor":
      return (
        <Panel>
          <p className="mb-4 font-mono text-xs text-fg-subtle">trim</p>
          <div className="relative h-3 rounded-full bg-surface-2">
            <span className="absolute inset-y-0 left-[18%] right-[30%] rounded-full bg-caption/80" />
            <span className="absolute -top-1.5 left-[18%] h-6 w-1.5 rounded bg-white" />
            <span className="absolute -top-1.5 right-[30%] h-6 w-1.5 rounded bg-white" />
          </div>
          <div className="mt-5 flex gap-2 text-sm">
            {["Karaoke", "Boxed", "Center crop"].map((t, i) => (
              <span key={t} className={cx("rounded-full border px-3 py-1.5", i === 0 ? "border-caption bg-caption/10 text-caption" : "border-white/10 text-fg-muted")}>
                {t}
              </span>
            ))}
          </div>
          <div className="mt-5 inline-block rounded-full bg-caption px-5 py-2 text-sm font-semibold text-ink">Re-render</div>
        </Panel>
      );
    default:
      return (
        <Panel>
          <p className="mb-3 font-mono text-xs text-fg-subtle">my-project-clips.zip</p>
          {["clip-1.mp4", "clip-2.mp4", "clip-3.mp4", "clip-4.mp4"].map((f) => (
            <div key={f} className="mb-2 flex items-center justify-between rounded-xl bg-surface-2 px-4 py-2.5 text-sm last:mb-0">
              <span>{f}</span>
              <span className="font-mono text-xs text-fg-subtle">1080 × 1920</span>
            </div>
          ))}
        </Panel>
      );
  }
}

"use client";
import { CAPTION_STYLES, REFRAMES } from "@/lib/styles";
import type { CaptionStyleId, Reframe } from "@/lib/types";

/** Tiny 9:16 tile that mimics what each caption style looks like. */
function Tile({ id }: { id: CaptionStyleId }) {
  const shadow = "[text-shadow:0_2px_0_rgba(0,0,0,0.7)]";
  return (
    <span className="relative block aspect-[9/16] w-full overflow-hidden rounded-lg bg-gradient-to-b from-[#3a4df0] to-navy">
      <span className="absolute left-1/2 top-[22%] h-[20%] w-[30%] -translate-x-1/2 rounded-full bg-white/20" />
      <span className="absolute left-1/2 top-[40%] h-[34%] w-[66%] -translate-x-1/2 rounded-t-[50%] bg-white/15" />
      <span className="absolute inset-x-1 bottom-[14%] text-center font-display font-extrabold leading-tight">
        {id === "karaoke" && (
          <span className={`text-[0.62rem] uppercase text-white ${shadow}`}>
            Nobody <span className="text-caption">tells</span>
          </span>
        )}
        {id === "pop" && <span className={`text-[1rem] uppercase text-caption ${shadow}`}>Tells</span>}
        {id === "boxed" && (
          <span className="rounded-[3px] bg-[#0b0f14] px-1 py-0.5 text-[0.55rem] text-white">
            Nobody <span className="text-caption">tells</span> you
          </span>
        )}
        {id === "clean" && <span className={`text-[0.55rem] font-semibold text-white ${shadow}`}>Nobody tells you</span>}
      </span>
    </span>
  );
}

export function StylePicker({
  value,
  onChange,
  disabled,
}: {
  value: CaptionStyleId;
  onChange: (v: CaptionStyleId) => void;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label="Caption style" className="grid grid-cols-4 gap-2.5">
      {CAPTION_STYLES.map((s) => (
        <button
          key={s.id}
          type="button"
          role="radio"
          aria-checked={value === s.id}
          disabled={disabled}
          title={s.note}
          onClick={() => onChange(s.id)}
          className={`rounded-xl border-2 p-1.5 text-left transition-colors disabled:opacity-50 ${
            value === s.id ? "border-cobalt bg-cobalt/5" : "border-transparent hover:border-mist-line"
          }`}
        >
          <Tile id={s.id} />
          <span className="mt-1.5 block px-0.5 text-xs font-semibold">{s.name}</span>
        </button>
      ))}
    </div>
  );
}

export function ReframePicker({
  value,
  onChange,
  disabled,
}: {
  value: Reframe;
  onChange: (v: Reframe) => void;
  disabled?: boolean;
}) {
  return (
    <div role="radiogroup" aria-label="Framing" className="grid gap-2 sm:grid-cols-2">
      {REFRAMES.map((r) => (
        <button
          key={r.id}
          type="button"
          role="radio"
          aria-checked={value === r.id}
          disabled={disabled}
          onClick={() => onChange(r.id)}
          className={`rounded-xl border-2 px-4 py-3 text-left transition-colors disabled:opacity-50 ${
            value === r.id ? "border-cobalt bg-cobalt/5" : "border-mist-line hover:border-navy/25"
          }`}
        >
          <span className="block text-sm font-semibold">{r.name}</span>
          <span className="mt-0.5 block text-xs text-navy/60">{r.note}</span>
        </button>
      ))}
    </div>
  );
}

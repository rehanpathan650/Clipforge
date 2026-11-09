import { SPECS } from "@/lib/content/steps";

export function SpecsTable() {
  return (
    <div className="overflow-hidden rounded-card border border-white/10 bg-surface">
      <table className="w-full text-left text-[0.95rem]">
        <caption className="sr-only">ClipForge specifications</caption>
        <tbody className="divide-y divide-white/10">
          {SPECS.map(([k, v]) => (
            <tr key={k}>
              <th scope="row" className="w-40 px-5 py-3.5 font-normal text-fg-subtle sm:w-56">
                {k}
              </th>
              <td className="px-5 py-3.5 font-medium">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Real numbers only; [value, unit, label]. Counters animate via ScrollEffects (final value is in the SSR text). */
const STATS: [number, string, string][] = [
  [120, "min", "longest source video"],
  [90, "s", "longest clip"],
  [4, "", "caption styles"],
  [2, "GB", "largest upload"],
];

export function StatStrip() {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-white/10 bg-white/10 lg:grid-cols-4">
      {STATS.map(([n, unit, label]) => (
        <div key={label} className="bg-surface px-6 py-7">
          <dd className="font-mono text-4xl font-semibold text-caption">
            <span data-count={n}>{n}</span>
            {unit && <span className="ml-1 text-xl text-fg-muted">{unit}</span>}
          </dd>
          <dt className="mt-1 text-sm text-fg-muted">{label}</dt>
        </div>
      ))}
    </dl>
  );
}

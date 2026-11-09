import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  body: string;
}

export function FeatureGrid({ items, cols = 3 }: { items: FeatureItem[]; cols?: 2 | 3 }) {
  return (
    <ul className={`mt-14 grid gap-4 sm:grid-cols-2 ${cols === 3 ? "lg:grid-cols-3" : ""}`}>
      {items.map(({ icon: Icon, title, body }) => (
        <li key={title} data-reveal>
          <Card interactive className="h-full">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-caption/10 text-caption">
              <Icon size={22} aria-hidden="true" />
            </span>
            <h3 className="mt-5 font-display text-xl font-bold tracking-tight">{title}</h3>
            <p className="mt-2 leading-relaxed text-fg-muted">{body}</p>
          </Card>
        </li>
      ))}
    </ul>
  );
}

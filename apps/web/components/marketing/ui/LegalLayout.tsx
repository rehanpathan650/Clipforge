import { Container } from "./Container";

export interface LegalSection {
  id: string;
  title: string;
  body: string[]; // paragraphs; lines starting with "- " become list items
}

function Block({ lines }: { lines: string[] }) {
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) {
      out.push(
        <ul key={`l${out.length}`}>
          {list.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };
  lines.forEach((l) => {
    if (l.startsWith("- ")) list.push(l.slice(2));
    else {
      flush();
      out.push(<p key={`p${out.length}`}>{l}</p>);
    }
  });
  flush();
  return <>{out}</>;
}

/** Long-form layout with a sticky table of contents. Used by /terms, /privacy, /refund-policy. */
export function LegalLayout({ title, updated, intro, sections }: { title: string; updated: string; intro: string; sections: LegalSection[] }) {
  return (
    <Container className="py-16 lg:py-24">
      <header className="max-w-prose">
        <h1 className="font-display text-5xl font-extrabold tracking-[-0.03em] sm:text-6xl">{title}</h1>
        <p className="mt-4 font-mono text-sm text-fg-subtle">Last updated {updated}</p>
        <p className="mt-6 text-lg leading-relaxed text-fg-muted">{intro}</p>
      </header>
      <div className="mt-12 grid gap-12 lg:grid-cols-[16rem_1fr]">
        <nav aria-label="Table of contents" className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-mono text-xs text-fg-subtle">On this page</p>
          <ol className="mt-3 space-y-1 border-l border-white/10">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-fg-muted hover:border-caption hover:text-fg">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <article className="mk-prose max-w-prose [&>section:first-child_h2]:mt-0">
          {sections.map((s) => (
            <section key={s.id}>
              <h2 id={s.id}>{s.title}</h2>
              <Block lines={s.body} />
            </section>
          ))}
        </article>
      </div>
    </Container>
  );
}

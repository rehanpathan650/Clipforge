import { Container } from "./Container";
import { SectionHeader } from "./SectionHeader";

/** Compact hero for inner pages. */
export function PageHero({ eyebrow, title, sub, children }: { eyebrow?: string; title: React.ReactNode; sub?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="mk-glow pointer-events-none absolute inset-x-0 top-0 h-[26rem] opacity-70" />
      <div aria-hidden="true" className="mk-grid pointer-events-none absolute inset-0 h-[30rem]" />
      <Container className="relative pb-16 pt-20 lg:pb-24 lg:pt-28">
        <SectionHeader as="h1" eyebrow={eyebrow} title={title} sub={sub} />
        {children && <div className="mt-8 flex flex-wrap justify-center gap-3">{children}</div>}
      </Container>
    </section>
  );
}

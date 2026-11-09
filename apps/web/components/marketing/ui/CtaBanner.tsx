import { ButtonLink } from "./Button";
import { Container } from "./Container";

export function CtaBanner({
  title = "Turn your next long video into a week of shorts.",
  sub = "Paste a link or upload a file. Your first clips are ready while you do something else.",
  cta = "Get started",
  href = "/signup",
}: {
  title?: string;
  sub?: string;
  cta?: string;
  href?: string;
}) {
  return (
    <section className="py-section" aria-label="Get started">
      <Container>
        <div className="relative overflow-hidden rounded-panel border border-white/10 bg-surface px-6 py-14 text-center shadow-glow-cobalt sm:px-12 sm:py-20">
          <div aria-hidden="true" className="mk-glow pointer-events-none absolute inset-0 opacity-80" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-5xl">{title}</h2>
            <p className="mt-4 text-lg text-fg-muted">{sub}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href={href} size="lg">
                {cta}
              </ButtonLink>
              <ButtonLink href="/pricing" variant="secondary" size="lg">
                See pricing
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

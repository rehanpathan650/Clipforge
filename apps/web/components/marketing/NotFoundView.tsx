import { ButtonLink } from "./ui/Button";
import { Container } from "./ui/Container";

export function NotFoundView() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="mk-glow pointer-events-none absolute inset-x-0 top-0 h-[30rem]" />
      <Container className="relative py-28 text-center lg:py-40">
        <p className="font-mono text-sm text-caption">404</p>
        <h1 className="mt-4 font-display text-5xl font-extrabold tracking-[-0.035em] sm:text-7xl">
          That clip <span className="text-caption">got cut</span>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg text-fg-muted">The page you're looking for doesn't exist or has moved.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" size="lg">
            Back to home
          </ButtonLink>
          <ButtonLink href="/help" variant="secondary" size="lg">
            Help center
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

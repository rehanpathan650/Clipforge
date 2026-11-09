"use client";
import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/marketing/ui/Button";
import { Container } from "@/components/marketing/ui/Container";

export default function MarketingError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <Container className="py-28 text-center lg:py-40">
      <p className="font-mono text-sm text-caption">Error</p>
      <h1 className="mt-4 font-display text-5xl font-extrabold tracking-[-0.035em] sm:text-6xl">Something went wrong</h1>
      <p className="mx-auto mt-6 max-w-md text-lg text-fg-muted">This page hit an error. Try again, or head back home.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={reset}>
          Try again
        </Button>
        <ButtonLink href="/" variant="secondary" size="lg">
          Back to home
        </ButtonLink>
      </div>
    </Container>
  );
}

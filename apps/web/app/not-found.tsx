import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { NotFoundView } from "@/components/marketing/NotFoundView";

// Root-level 404 (unmatched URLs): the root layout has no chrome, so add it here.
export default function RootNotFound() {
  return (
    <div className="mk">
      <Navbar />
      <main id="main">
        <NotFoundView />
      </main>
      <Footer />
    </div>
  );
}

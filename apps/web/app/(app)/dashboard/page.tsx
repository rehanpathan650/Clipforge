import type { Metadata } from "next";
import { NewProject } from "@/components/NewProject";
import { ProjectList } from "@/components/ProjectList";

export const metadata: Metadata = { title: "Projects" };

export default function DashboardPage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-14">
      <NewProject />
      <ProjectList />
    </main>
  );
}

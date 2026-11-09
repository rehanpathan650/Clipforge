import type { Metadata } from "next";
import { ClipEditor } from "@/components/ClipEditor";

export const metadata: Metadata = { title: "Edit clip" };

export default async function EditClipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClipEditor id={id} />;
}

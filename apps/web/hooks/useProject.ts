"use client";
import { useCallback, useEffect, useState } from "react";
import { api, apiBase, errorMessage } from "@/lib/api";
import { isActive, type ProgressEvent, type Project } from "@/lib/types";

/** Loads a project and keeps it live over Server-Sent Events while it is processing. */
export function useProject(id: string) {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setProject(await api.get<Project>(`/api/projects/${id}`));
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const active = project ? isActive(project.status) : false;
  const rendering = project?.clips.some((c) => c.status === "RENDERING") ?? false;

  useEffect(() => {
    if (!active) return;
    const es = new EventSource(`${apiBase}/api/projects/${id}/events`, { withCredentials: true });
    es.onmessage = (ev) => {
      const e = JSON.parse(ev.data) as ProgressEvent;
      setProject((p) => (p ? { ...p, status: e.status, stage: e.stage, progress: e.progress, error: e.error } : p));
      if (e.status === "READY" || e.status === "FAILED") {
        es.close();
        void reload();
      }
    };
    // Safety net in case a proxy buffers or drops the event stream.
    const poll = setInterval(() => void reload(), 10_000);
    return () => {
      es.close();
      clearInterval(poll);
    };
  }, [active, id, reload]);

  // A clip being re-rendered from the editor: poll until it settles.
  useEffect(() => {
    if (!rendering) return;
    const t = setInterval(() => void reload(), 3000);
    return () => clearInterval(t);
  }, [rendering, reload]);

  return { project, error, reload };
}

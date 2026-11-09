import { ImageResponse } from "next/og";

export const alt = "ClipForge: long videos in, short clips out";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#07080F", color: "#F5F6FB", position: "relative" }}>
        <div style={{ position: "absolute", top: -200, left: 300, width: 700, height: 700, borderRadius: 700, background: "rgba(35,56,255,0.35)", filter: "blur(120px)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#FFD60A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 6, height: 26, borderRadius: 3, background: "#07080F", transform: "rotate(18deg)" }} />
          </div>
          <div style={{ fontSize: 38, fontWeight: 700 }}>ClipForge</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 112, fontWeight: 800, lineHeight: 0.95, letterSpacing: -4 }}>
          <div>Hours in.</div>
          <div style={{ color: "#FFD60A" }}>Shorts out.</div>
        </div>
        <div style={{ fontSize: 30, color: "#A9AFC6" }}>Vertical 1080×1920 clips with word-by-word captions.</div>
      </div>
    ),
    size,
  );
}

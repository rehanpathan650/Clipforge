import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#FFD60A", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 4, height: 16, borderRadius: 2, background: "#07080F", transform: "rotate(18deg)" }} />
      </div>
    ),
    size,
  );
}

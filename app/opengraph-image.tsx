import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "WayneChoi.dev — Graphics programming and software engineering";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(135deg, #eff6ff, #dbeafe 55%, #ffffff)",
        color: "#172554",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <div style={{ fontFamily: "Georgia", fontSize: 86, fontStyle: "italic", fontWeight: 700 }}>WayneChoi.dev</div>
      <div style={{ color: "#475569", fontSize: 34, marginTop: 24 }}>Graphics programming · Web · Computer science</div>
    </div>,
    size,
  );
}

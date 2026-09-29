import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/data";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background: "#050505",
          backgroundImage:
            "radial-gradient(circle at 80% 20%, rgba(0,245,255,0.25), transparent 50%), radial-gradient(circle at 10% 90%, rgba(124,58,237,0.25), transparent 50%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 700,
              color: "#050505",
              background: "linear-gradient(135deg, #00F5FF, #7C3AED)",
            }}
          >
            {siteConfig.initials}
          </div>
          <span style={{ fontSize: "28px", letterSpacing: "0.3em", color: "#BDBDBD" }}>
            OSMANBILGIN.DEV
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontWeight: 700 }}>
          <span style={{ fontSize: "92px", lineHeight: 1.05 }}>{siteConfig.name}</span>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            marginTop: "36px",
          }}
        >
          {siteConfig.titles.map((title) => (
            <div
              key={title}
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,0.15)",
                fontSize: "24px",
                color: "#00F5FF",
                letterSpacing: "0.05em",
              }}
            >
              {title}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "48px",
            fontSize: "28px",
            color: "#BDBDBD",
            maxWidth: "900px",
          }}
        >
          Building digital experiences without limits.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

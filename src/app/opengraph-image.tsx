import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "eFootballMarket - Institutional eFootball Account Escrow Marketplace";
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
          justifyContent: "space-between",
          padding: "70px 80px",
          backgroundColor: "#090d16",
          backgroundImage:
            "radial-gradient(circle at 25% 30%, rgba(37, 99, 235, 0.35) 0%, transparent 60%), radial-gradient(circle at 80% 70%, rgba(217, 119, 6, 0.25) 0%, transparent 50%), radial-gradient(circle at 85% 20%, rgba(5, 150, 105, 0.3) 0%, transparent 50%)",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top Header / Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {/* Logo Shield Icon */}
          <div
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #0284c7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 25px rgba(37, 99, 235, 0.4)",
              border: "2px solid rgba(251, 191, 36, 0.5)",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#ffffff",
                }}
              />
            </div>
          </div>

          <div>
            <div
              style={{
                fontSize: "42px",
                fontWeight: 900,
                letterSpacing: "-1px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span>eFootball</span>
              <span style={{ color: "#38bdf8" }}>Market</span>
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#f59e0b",
                letterSpacing: "4px",
                marginTop: "2px",
              }}
            >
              INSTITUTIONAL ESCROW EXCHANGE
            </div>
          </div>
        </div>

        {/* Main Pitch Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div
            style={{
              fontSize: "54px",
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
              maxWidth: "1000px",
            }}
          >
            Trade High-OVR eFootball Accounts
          </div>
          <div
            style={{
              fontSize: "54px",
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
              color: "#10b981",
              maxWidth: "1000px",
            }}
          >
            With 100% Guaranteed M-Pesa Escrow.
          </div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 500,
              color: "#94a3b8",
              marginTop: "8px",
            }}
          >
            Eliminate peer-to-peer scams. Automated Lipa Na M-Pesa STK push & 24h inspection protection.
          </div>
        </div>

        {/* Trust Badges Ribbon */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "rgba(30, 41, 59, 0.8)",
              border: "1.5px solid rgba(51, 65, 85, 0.8)",
              borderRadius: "999px",
              padding: "12px 22px",
              fontSize: "16px",
              fontWeight: 700,
              color: "#f1f5f9",
            }}
          >
            <span style={{ color: "#10b981" }}>✓</span>
            <span>100% Escrow Protected</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "rgba(30, 41, 59, 0.8)",
              border: "1.5px solid rgba(51, 65, 85, 0.8)",
              borderRadius: "999px",
              padding: "12px 22px",
              fontSize: "16px",
              fontWeight: 700,
              color: "#f1f5f9",
            }}
          >
            <span style={{ color: "#10b981" }}>KES</span>
            <span>Lipa Na M-Pesa STK Push</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              backgroundColor: "rgba(30, 41, 59, 0.8)",
              border: "1.5px solid rgba(51, 65, 85, 0.8)",
              borderRadius: "999px",
              padding: "12px 22px",
              fontSize: "16px",
              fontWeight: 700,
              color: "#f1f5f9",
            }}
          >
            <span style={{ color: "#f59e0b" }}>⏱</span>
            <span>24-Hour Inspection Window</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const TerminalWindow: React.FC<{
  children: React.ReactNode;
  delay?: number;
  title?: string;
  width?: number;
}> = ({ children, delay = 0, title = "Terminal", width = 900 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 28,
      mass: 1.5,
      overshootClamping: true,
      stiffness: 80,
    },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const scale = interpolate(entrance, [0, 1], [0.92, 1]);
  const translateY = interpolate(entrance, [0, 1], [40, 0]);
  const blur = interpolate(entrance, [0, 0.4], [6, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale}) perspective(1200px) rotateX(2deg)`,
        filter: `blur(${blur}px)`,
        width,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow:
          "0 25px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 102, 255, 0.08)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          background: "rgba(30, 30, 40, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: "flex", gap: 7 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#FF5F57",
              boxShadow: "0 0 4px #FF5F5740",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#FEBC2E",
              boxShadow: "0 0 4px #FEBC2E40",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#28C840",
              boxShadow: "0 0 4px #28C84040",
            }}
          />
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 13,
            color: "#6B7280",
            fontFamily: "'SF Mono', monospace",
          }}
        >
          {title}
        </div>
        <div style={{ width: 52 }} />
      </div>

      {/* Content area */}
      <div
        style={{
          background: "rgba(13, 13, 20, 0.97)",
          padding: "20px 24px",
          fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
          fontSize: 16,
          lineHeight: 1.7,
          color: "#E2E8F0",
          minHeight: 200,
        }}
      >
        {children}
      </div>
    </div>
  );
};

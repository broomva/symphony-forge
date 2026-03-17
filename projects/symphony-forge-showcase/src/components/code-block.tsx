import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const CodeBlock: React.FC<{
  text: string;
  delay?: number;
  fontSize?: number;
  color?: string;
}> = ({ text, delay = 0, fontSize = 28, color = "#A5F3FC" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateX = interpolate(entrance, [0, 1], [-20, 0]);

  return (
    <div
      style={{
        fontSize,
        fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
        color,
        opacity,
        transform: `translateX(${translateX}px)`,
        background: "rgba(255,255,255,0.06)",
        padding: "12px 20px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.1)",
        lineHeight: 1.5,
      }}
    >
      <span style={{ color: "#6B7280", marginRight: 8 }}>$</span>
      {text}
    </div>
  );
};

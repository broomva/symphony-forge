import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const GlassCard: React.FC<{
  children: React.ReactNode;
  delay?: number;
  glowColor?: string;
}> = ({ children, delay = 0, glowColor = "#0066FF" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 28, mass: 1, overshootClamping: true, stiffness: 120 },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [30, 0]);
  const scale = interpolate(entrance, [0, 1], [0.96, 1]);
  const blur = interpolate(entrance, [0, 0.5], [4, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        filter: `blur(${blur}px)`,
        background: "rgba(255, 255, 255, 0.06)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: 20,
        padding: "32px 40px",
        boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 40px ${glowColor}08, inset 0 1px 0 rgba(255, 255, 255, 0.08)`,
      }}
    >
      {children}
    </div>
  );
};

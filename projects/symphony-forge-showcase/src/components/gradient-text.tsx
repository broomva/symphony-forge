import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const GradientText: React.FC<{
  delay?: number;
  fontSize?: number;
  from?: string;
  text: string;
  to?: string;
}> = ({ text, delay = 0, fontSize = 64, from = "#0066FF", to = "#00CC66" }) => {
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
  const scale = interpolate(entrance, [0, 1], [0.95, 1]);
  const blur = interpolate(entrance, [0, 0.5], [6, 0], {
    extrapolateRight: "clamp",
  });

  // Animated color interpolation instead of background-clip
  const colorProgress = interpolate(frame, [0, 90], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Interpolate between from and to colors for a subtle shift
  const r1 = Number.parseInt(from.slice(1, 3), 16);
  const g1 = Number.parseInt(from.slice(3, 5), 16);
  const b1 = Number.parseInt(from.slice(5, 7), 16);
  const r2 = Number.parseInt(to.slice(1, 3), 16);
  const g2 = Number.parseInt(to.slice(3, 5), 16);
  const b2 = Number.parseInt(to.slice(5, 7), 16);

  const r = Math.round(r1 + (r2 - r1) * colorProgress);
  const g = Math.round(g1 + (g2 - g1) * colorProgress);
  const b = Math.round(b1 + (b2 - b1) * colorProgress);

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        filter: `blur(${blur}px)`,
        fontSize,
        fontWeight: 800,
        fontFamily: "'Poppins', sans-serif",
        letterSpacing: "-0.03em",
        lineHeight: 1.1,
        color: `rgb(${r}, ${g}, ${b})`,
        textShadow: `0 0 40px rgba(${r}, ${g}, ${b}, 0.3)`,
      }}
    >
      {text}
    </div>
  );
};

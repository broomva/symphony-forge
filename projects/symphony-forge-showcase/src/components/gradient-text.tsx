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

  // Animated gradient shift
  const gradientPos = interpolate(frame, [0, 120], [0, 100]);

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
        background: `linear-gradient(90deg, ${from} ${gradientPos}%, ${to} ${gradientPos + 50}%, ${from} ${gradientPos + 100}%)`,
        backgroundSize: "200% 100%",
        backgroundPosition: `${gradientPos}% 0`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {text}
    </div>
  );
};

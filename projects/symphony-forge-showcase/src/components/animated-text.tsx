import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const AnimatedText: React.FC<{
  text: string;
  delay?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  y?: number;
}> = ({
  text,
  delay = 0,
  fontSize = 48,
  color = "#FFFFFF",
  fontWeight = 700,
  y = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [30 + y, y]);

  return (
    <div
      style={{
        fontSize,
        fontWeight,
        color,
        opacity,
        transform: `translateY(${translateY}px)`,
        fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif",
        letterSpacing: fontSize > 40 ? "-0.02em" : "0",
        lineHeight: 1.2,
      }}
    >
      {text}
    </div>
  );
};

import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const Counter: React.FC<{
  color?: string;
  delay?: number;
  fontSize?: number;
  suffix?: string;
  value: number;
}> = ({ value, delay = 0, fontSize = 72, color = "#FFFFFF", suffix = "" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 28,
      mass: 1,
      overshootClamping: true,
      stiffness: 120,
    },
  });

  const countProgress = interpolate(frame - delay, [0, 30], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const displayValue = Math.round(countProgress * value);
  const blur = interpolate(entrance, [0, 0.4], [4, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity: entrance,
        filter: `blur(${blur}px)`,
        transform: `scale(${0.9 + entrance * 0.1})`,
        fontSize,
        fontWeight: 800,
        color,
        fontFamily: "'Poppins', sans-serif",
        letterSpacing: "-0.03em",
        textShadow: `0 0 30px ${color}40`,
      }}
    >
      {displayValue}
      {suffix}
    </div>
  );
};

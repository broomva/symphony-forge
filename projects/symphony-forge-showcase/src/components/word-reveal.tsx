import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const WordReveal: React.FC<{
  color?: string;
  delay?: number;
  fontSize?: number;
  fontWeight?: number;
  text: string;
}> = ({
  text,
  delay = 0,
  fontSize = 48,
  fontWeight = 700,
  color = "#FFFFFF",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  const wordDelay = 4;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0 12px",
        fontSize,
        fontWeight,
        color,
        fontFamily: "'Poppins', sans-serif",
        lineHeight: 1.3,
      }}
    >
      {words.map((word, i) => {
        const progress = spring({
          frame: frame - delay - i * wordDelay,
          fps,
          config: {
            damping: 20,
            overshootClamping: true,
            stiffness: 120,
          },
        });
        const wordBlur = interpolate(progress, [0, 0.6], [4, 0], {
          extrapolateRight: "clamp",
        });
        return (
          <span
            key={`${word}-${i.toString()}`}
            style={{
              opacity: progress,
              filter: `blur(${wordBlur}px)`,
              transform: `translateY(${(1 - progress) * 12}px)`,
              display: "inline-block",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

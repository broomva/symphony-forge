import { interpolate, useCurrentFrame } from "remotion";

export const TypedLine: React.FC<{
  color?: string;
  delay?: number;
  prefix?: string;
  prefixColor?: string;
  speed?: number;
  text: string;
}> = ({
  text,
  delay = 0,
  speed = 1.5,
  color = "#E2E8F0",
  prefix = "",
  prefixColor = "#4A5568",
}) => {
  const frame = useCurrentFrame();

  const typeStart = frame - delay;
  const charsToShow = Math.max(0, Math.floor(typeStart / speed));
  const visibleText = text.slice(0, Math.min(charsToShow, text.length));
  const done = charsToShow >= text.length;
  const showCursor = !done && typeStart > 0;
  const cursorBlink = Math.floor(frame / 12) % 2 === 0;

  const lineOpacity = interpolate(typeStart, [-5, 0], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ opacity: lineOpacity, whiteSpace: "pre" }}>
      {prefix && <span style={{ color: prefixColor }}>{prefix}</span>}
      <span style={{ color }}>{visibleText}</span>
      {showCursor && (
        <span style={{ color: "#0066FF", opacity: cursorBlink ? 1 : 0 }}>
          |
        </span>
      )}
    </div>
  );
};

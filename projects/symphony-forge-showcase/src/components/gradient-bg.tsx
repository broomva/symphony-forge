import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

export const GradientBg: React.FC = () => {
  const frame = useCurrentFrame();

  // Subtle animated gradient mesh
  const pos1 = 20 + Math.sin(frame * 0.015) * 12;
  const pos2 = 60 + Math.cos(frame * 0.012) * 15;
  const pos3 = 80 + Math.sin(frame * 0.018 + 1) * 12;
  const hue = interpolate(frame, [0, 300], [210, 230]);

  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse at ${pos1}% ${pos2}%, hsla(${hue}, 80%, 30%, 0.25) 0%, transparent 55%),
          radial-gradient(ellipse at ${pos3}% ${100 - pos1}%, hsla(${hue + 30}, 70%, 25%, 0.2) 0%, transparent 50%),
          linear-gradient(145deg, #001F3F 0%, #12121A 100%)
        `,
      }}
    />
  );
};

import { AbsoluteFill } from "remotion";

export const Vignette: React.FC<{ intensity?: number }> = ({
  intensity = 0.65,
}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at center, transparent 35%, rgba(0, 0, 0, ${intensity}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

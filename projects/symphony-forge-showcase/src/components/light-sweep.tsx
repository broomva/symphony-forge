import { Easing, interpolate, useCurrentFrame } from "remotion";

export const LightSweep: React.FC<{
  children: React.ReactNode;
  delay?: number;
}> = ({ children, delay = 20 }) => {
  const frame = useCurrentFrame();

  const sweepPosition = interpolate(frame - delay, [0, 30], [-100, 200], {
    easing: Easing.bezier(0.4, 0, 0.2, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        display: "inline-block",
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: `linear-gradient(105deg, transparent ${sweepPosition - 30}%, rgba(255, 255, 255, 0.15) ${sweepPosition}%, transparent ${sweepPosition + 30}%)`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

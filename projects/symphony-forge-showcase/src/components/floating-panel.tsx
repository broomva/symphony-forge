import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const FloatingPanel: React.FC<{
  children: React.ReactNode;
  delay?: number;
  rotateX?: number;
  rotateY?: number;
  x?: number;
  y?: number;
}> = ({ children, delay = 0, rotateX = 5, rotateY = -8, x = 0, y = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 28,
      mass: 2,
      overshootClamping: true,
      stiffness: 80,
    },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const scale = interpolate(entrance, [0, 1], [0.85, 1]);
  const blur = interpolate(entrance, [0, 0.5], [8, 0], {
    extrapolateRight: "clamp",
  });

  // Gentle hover animation
  const hover = Math.sin(frame * 0.02) * 3;

  return (
    <div
      style={{
        opacity,
        transform: `
          perspective(1200px)
          translate(${x}px, ${y + hover}px)
          scale(${scale})
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
        `,
        filter: `blur(${blur}px)`,
        background: "rgba(255, 255, 255, 0.04)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.10)",
        borderRadius: 16,
        padding: "24px 28px",
        boxShadow:
          "0 20px 50px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 102, 255, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  );
};

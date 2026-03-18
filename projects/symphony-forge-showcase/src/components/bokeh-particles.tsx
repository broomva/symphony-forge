import {
  AbsoluteFill,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

interface Particle {
  delay: number;
  hue: number;
  opacity: number;
  size: number;
  speed: number;
  x: number;
  y: number;
}

export const BokehParticles: React.FC<{ count?: number }> = ({
  count = 30,
}) => {
  const frame = useCurrentFrame();
  const { height, width } = useVideoConfig();

  const particles: Particle[] = Array.from({ length: count }, (_, i) => ({
    x: random(`x-${i}`) * width,
    y: random(`y-${i}`) * height,
    size: 4 + random(`size-${i}`) * 16,
    speed: 0.15 + random(`speed-${i}`) * 0.4,
    opacity: 0.08 + random(`opacity-${i}`) * 0.25,
    hue: random(`hue-${i}`) * 40 + 200,
    delay: random(`delay-${i}`) * 60,
  }));

  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {particles.map((p, i) => {
        const adjustedFrame = frame - p.delay;
        const y = p.y - adjustedFrame * p.speed;
        const x = p.x + Math.sin(adjustedFrame * 0.02 + i) * 25;
        const pulse = 0.8 + Math.sin(adjustedFrame * 0.04 + i) * 0.2;

        return (
          <div
            key={`particle-${p.hue.toFixed(0)}-${p.size.toFixed(0)}`}
            style={{
              position: "absolute",
              left: x,
              top: ((y % (height + 40)) + height + 40) % (height + 40),
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, hsla(${p.hue}, 80%, 65%, ${p.opacity * pulse}), transparent 70%)`,
              filter: `blur(${p.size * 0.3}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

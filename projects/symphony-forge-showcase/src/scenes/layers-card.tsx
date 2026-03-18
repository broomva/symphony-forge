import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Layer } from "../data/content";

export const CinematicLayerCard: React.FC<{
  index: number;
  layer: Layer;
}> = ({ layer, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = 12 + index * 10;
  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 28, mass: 1, overshootClamping: true, stiffness: 120 },
  });
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateX = interpolate(entrance, [0, 1], [50, 0]);
  const scale = interpolate(entrance, [0, 1], [0.95, 1]);
  const blur = interpolate(entrance, [0, 0.4], [3, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        opacity,
        transform: `translateX(${translateX}px) scale(${scale})`,
        filter: `blur(${blur}px)`,
        background: `linear-gradient(145deg, rgba(255,255,255,0.06), ${layer.color}08)`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${layer.color}20`,
        borderRadius: 16,
        padding: "16px 24px",
        marginBottom: 10,
        boxShadow: `0 8px 24px rgba(0, 0, 0, 0.25), 0 0 30px ${layer.color}08, inset 0 1px 0 rgba(255, 255, 255, 0.06)`,
      }}
    >
      <div
        style={{
          fontSize: 32,
          width: 50,
          height: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `${layer.color}12`,
          borderRadius: 12,
          flexShrink: 0,
          boxShadow: `0 0 20px ${layer.color}15`,
        }}
      >
        {layer.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: layer.color,
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 3,
            textShadow: `0 0 20px ${layer.color}40`,
          }}
        >
          {layer.name}
        </div>
        <div
          style={{
            fontSize: 16,
            color: "#8899AA",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          {layer.description}
        </div>
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#556677",
          fontFamily: "'JetBrains Mono', monospace",
          textAlign: "right",
          flexShrink: 0,
        }}
      >
        {layer.files}
      </div>
    </div>
  );
};

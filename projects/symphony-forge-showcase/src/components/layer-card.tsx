import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Layer } from "../data/content";

export const LayerCard: React.FC<{
  layer: Layer;
  index: number;
}> = ({ layer, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = index * 8;
  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 200 },
  });
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateX = interpolate(entrance, [0, 1], [60, 0]);
  const scale = interpolate(entrance, [0, 1], [0.9, 1]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        opacity,
        transform: `translateX(${translateX}px) scale(${scale})`,
        background: `linear-gradient(135deg, ${layer.color}18, ${layer.color}08)`,
        border: `1px solid ${layer.color}40`,
        borderRadius: 16,
        padding: "18px 24px",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          fontSize: 36,
          width: 56,
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `${layer.color}25`,
          borderRadius: 12,
          flexShrink: 0,
        }}
      >
        {layer.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: layer.color,
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 4,
          }}
        >
          {layer.name}
        </div>
        <div
          style={{
            fontSize: 18,
            color: "#94A3B8",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {layer.description}
        </div>
      </div>
      <div
        style={{
          fontSize: 14,
          color: "#64748B",
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

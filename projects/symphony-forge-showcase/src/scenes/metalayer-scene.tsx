import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimatedText } from "../components/animated-text";
import { metalayerMapping } from "../data/content";

export const MetalayerScene: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(135deg, #0F0A1A 0%, #1A0A2E 50%, #0F172A 100%)",
        display: "flex",
        flexDirection: "column",
        padding: 60,
      }}
    >
      <AnimatedText
        color="#E2E8F0"
        delay={0}
        fontSize={44}
        text="Control Theory Mapping"
      />
      <div style={{ height: 8 }} />
      <AnimatedText
        color="#64748B"
        delay={8}
        fontSize={22}
        fontWeight={400}
        text="Every layer maps to a control system primitive"
      />
      <div style={{ height: 48 }} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          justifyContent: "center",
        }}
      >
        {metalayerMapping.map((item, i) => (
          <MappingRow key={item.theory} {...item} index={i} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const MappingRow: React.FC<{
  theory: string;
  implementation: string;
  color: string;
  index: number;
}> = ({ theory, implementation, color, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = 15 + index * 8;
  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 180 },
  });
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const scale = interpolate(entrance, [0, 1], [0.85, 1]);

  // Arrow animation
  const arrowDelay = delay + 10;
  const arrowEntrance = spring({
    frame: frame - arrowDelay,
    fps,
    config: { damping: 200 },
  });
  const arrowOpacity = interpolate(arrowEntrance, [0, 1], [0, 1]);
  const arrowX = interpolate(arrowEntrance, [0, 1], [-10, 0]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* Theory side */}
      <div
        style={{
          flex: 1,
          textAlign: "right",
          fontSize: 28,
          fontWeight: 700,
          color: "#E2E8F0",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {theory}
      </div>

      {/* Arrow */}
      <div
        style={{
          opacity: arrowOpacity,
          transform: `translateX(${arrowX}px)`,
          fontSize: 28,
          color,
          fontFamily: "monospace",
          width: 60,
          textAlign: "center",
        }}
      >
        {"\u2192"}
      </div>

      {/* Implementation side */}
      <div
        style={{
          flex: 1.5,
          fontSize: 24,
          fontWeight: 500,
          color,
          fontFamily: "'JetBrains Mono', monospace",
          background: `${color}12`,
          border: `1px solid ${color}30`,
          borderRadius: 12,
          padding: "12px 20px",
        }}
      >
        {implementation}
      </div>
    </div>
  );
};

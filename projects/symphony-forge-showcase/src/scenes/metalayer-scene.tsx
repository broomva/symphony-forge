import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BokehParticles } from "../components/bokeh-particles";
import { GradientBg } from "../components/gradient-bg";
import { Vignette } from "../components/vignette";
import { WordReveal } from "../components/word-reveal";
import { metalayerMapping } from "../data/content";

export const MetalayerScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <GradientBg />
      <BokehParticles count={12} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 60,
        }}
      >
        <WordReveal
          color="#FFFFFF"
          delay={0}
          fontSize={44}
          text="Control Theory Mapping"
        />
        <div style={{ height: 8 }} />
        <WordReveal
          color="#556677"
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

      <Vignette intensity={0.4} />
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
    config: { damping: 28, mass: 1, overshootClamping: true, stiffness: 120 },
  });
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const scale = interpolate(entrance, [0, 1], [0.85, 1]);
  const blur = interpolate(entrance, [0, 0.4], [3, 0], {
    extrapolateRight: "clamp",
  });

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
        filter: `blur(${blur}px)`,
      }}
    >
      {/* Theory side */}
      <div
        style={{
          flex: 1,
          textAlign: "right",
          fontSize: 28,
          fontWeight: 700,
          color: "#FFFFFF",
          fontFamily: "'Poppins', sans-serif",
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
          background: `${color}10`,
          border: `1px solid ${color}30`,
          borderRadius: 12,
          padding: "12px 20px",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: `0 8px 20px rgba(0, 0, 0, 0.25), 0 0 20px ${color}08, inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
          textShadow: `0 0 15px ${color}40`,
        }}
      >
        {implementation}
      </div>
    </div>
  );
};

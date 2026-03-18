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
      <BokehParticles count={15} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "50px 60px",
        }}
      >
        <WordReveal
          color="#FFFFFF"
          delay={0}
          fontSize={40}
          text="Maps to control theory"
        />
        <div style={{ height: 8 }} />
        <WordReveal
          color="#556677"
          delay={6}
          fontSize={20}
          fontWeight={400}
          text="Every layer is a control system primitive"
        />
        <div style={{ height: 36 }} />

        {/* Mapping rows with glass panels */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            justifyContent: "center",
          }}
        >
          {metalayerMapping.map((item, i) => (
            <MappingRow key={item.theory} {...item} index={i} />
          ))}
        </div>
      </AbsoluteFill>

      <Vignette intensity={0.45} />
    </AbsoluteFill>
  );
};

const MappingRow: React.FC<{
  color: string;
  implementation: string;
  index: number;
  theory: string;
}> = ({ theory, implementation, color, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = 12 + index * 10;
  const entrance = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 28,
      mass: 1,
      overshootClamping: true,
      stiffness: 120,
    },
  });
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const scale = interpolate(entrance, [0, 1], [0.9, 1]);
  const blur = interpolate(entrance, [0, 0.4], [4, 0], {
    extrapolateRight: "clamp",
  });

  // Arrow
  const arrowEntrance = spring({
    frame: frame - delay - 8,
    fps,
    config: { damping: 200 },
  });
  const arrowOpacity = interpolate(arrowEntrance, [0, 1], [0, 1]);
  const arrowScale = interpolate(arrowEntrance, [0, 1], [0.5, 1]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        opacity,
        transform: `scale(${scale})`,
        filter: `blur(${blur}px)`,
      }}
    >
      {/* Theory label */}
      <div
        style={{
          flex: 1,
          textAlign: "right",
          fontSize: 26,
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
          transform: `scale(${arrowScale})`,
          width: 50,
          height: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `${color}12`,
          borderRadius: "50%",
          border: `1px solid ${color}25`,
          fontSize: 22,
          color,
          textShadow: `0 0 15px ${color}50`,
        }}
      >
        {"\u2192"}
      </div>

      {/* Implementation panel */}
      <div
        style={{
          flex: 1.5,
          fontSize: 22,
          fontWeight: 600,
          color,
          fontFamily: "'JetBrains Mono', monospace",
          background: `linear-gradient(145deg, ${color}08, rgba(255,255,255,0.03))`,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${color}20`,
          borderRadius: 14,
          padding: "14px 22px",
          boxShadow: `0 10px 25px rgba(0, 0, 0, 0.25), 0 0 20px ${color}06, inset 0 1px 0 rgba(255, 255, 255, 0.04)`,
          textShadow: `0 0 15px ${color}30`,
        }}
      >
        {implementation}
      </div>
    </div>
  );
};

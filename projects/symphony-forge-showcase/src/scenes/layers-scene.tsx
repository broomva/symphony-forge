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
import { layers } from "../data/content";

export const LayersScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <GradientBg />
      <BokehParticles count={18} />

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
          text="5 composable layers"
        />
        <div style={{ height: 28 }} />

        {/* Layer cards with staggered 3D entrance */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {layers.map((layer, i) => (
            <FloatingLayerCard index={i} key={layer.name} layer={layer} />
          ))}
        </div>
      </AbsoluteFill>

      <Vignette intensity={0.4} />
    </AbsoluteFill>
  );
};

const FloatingLayerCard: React.FC<{
  index: number;
  layer: (typeof layers)[number];
}> = ({ layer, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = 10 + index * 12;
  const entrance = spring({
    frame: frame - delay,
    fps,
    config: {
      damping: 28,
      mass: 1,
      overshootClamping: true,
      stiffness: 100,
    },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateX = interpolate(entrance, [0, 1], [80, 0]);
  const scale = interpolate(entrance, [0, 1], [0.92, 1]);
  const blur = interpolate(entrance, [0, 0.4], [4, 0], {
    extrapolateRight: "clamp",
  });
  // Slight 3D tilt based on index
  const rotateY = interpolate(entrance, [0, 1], [-5, 0]);

  // Gentle hover
  const hover = Math.sin(frame * 0.025 + index * 0.5) * 2;

  return (
    <div
      style={{
        opacity,
        transform: `perspective(1200px) translateX(${translateX}px) translateY(${hover}px) scale(${scale}) rotateY(${rotateY}deg)`,
        filter: `blur(${blur}px)`,
        display: "flex",
        alignItems: "center",
        gap: 20,
        background: `linear-gradient(145deg, rgba(255,255,255,0.05), ${layer.color}06)`,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: `1px solid ${layer.color}18`,
        borderRadius: 16,
        padding: "16px 28px",
        boxShadow: `0 12px 30px rgba(0, 0, 0, 0.3), 0 0 25px ${layer.color}06, inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
      }}
    >
      <div
        style={{
          fontSize: 34,
          width: 52,
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `${layer.color}10`,
          borderRadius: 14,
          flexShrink: 0,
          boxShadow: `0 0 20px ${layer.color}12`,
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
            textShadow: `0 0 20px ${layer.color}35`,
            marginBottom: 2,
          }}
        >
          {layer.name}
        </div>
        <div
          style={{
            fontSize: 15,
            color: "#7B8FA0",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          {layer.description}
        </div>
      </div>
      <div
        style={{
          fontSize: 13,
          color: "#4A5C6B",
          fontFamily: "'JetBrains Mono', monospace",
          textAlign: "right",
          flexShrink: 0,
          padding: "6px 12px",
          background: "rgba(255, 255, 255, 0.03)",
          borderRadius: 8,
          border: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        {layer.files}
      </div>
    </div>
  );
};

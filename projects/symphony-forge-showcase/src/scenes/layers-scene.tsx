import { AbsoluteFill } from "remotion";
import { AnimatedText } from "../components/animated-text";
import { LayerCard } from "../components/layer-card";
import { layers } from "../data/content";

export const LayersScene: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(135deg, #0F0A1A 0%, #1A0A2E 50%, #0F172A 100%)",
        display: "flex",
        flexDirection: "column",
        padding: "60px 60px 40px",
      }}
    >
      <AnimatedText
        color="#E2E8F0"
        delay={0}
        fontSize={44}
        text="5 Composable Layers"
      />
      <div style={{ height: 8 }} />
      <AnimatedText
        color="#64748B"
        delay={8}
        fontSize={22}
        fontWeight={400}
        text="Each works independently, adapts when combined"
      />
      <div style={{ height: 32 }} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {layers.map((layer, i) => (
          <LayerCard index={i} key={layer.name} layer={layer} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

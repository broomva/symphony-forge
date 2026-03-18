import { AbsoluteFill } from "remotion";
import { AnimatedText } from "../components/animated-text";
import { LayerCard } from "../components/layer-card";
import { layers } from "../data/content";

export const LayersScene: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(145deg, #001F3F 0%, #12121A 100%)",
        display: "flex",
        flexDirection: "column",
        padding: "60px 60px 40px",
      }}
    >
      <AnimatedText
        color="#FFFFFF"
        delay={0}
        fontSize={44}
        text="5 Composable Layers"
      />
      <div style={{ height: 8 }} />
      <AnimatedText
        color="#556677"
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

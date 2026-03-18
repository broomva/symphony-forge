import { AbsoluteFill } from "remotion";
import { BokehParticles } from "../components/bokeh-particles";
import { GradientBg } from "../components/gradient-bg";
import { Vignette } from "../components/vignette";
import { WordReveal } from "../components/word-reveal";
import { layers } from "../data/content";
import { CinematicLayerCard } from "./layers-card";

export const LayersScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <GradientBg />
      <BokehParticles count={15} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "60px 60px 40px",
        }}
      >
        <WordReveal
          color="#FFFFFF"
          delay={0}
          fontSize={44}
          text="5 Composable Layers"
        />
        <div style={{ height: 12 }} />
        <WordReveal
          color="#556677"
          delay={6}
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
            <CinematicLayerCard index={i} key={layer.name} layer={layer} />
          ))}
        </div>
      </AbsoluteFill>

      <Vignette intensity={0.4} />
    </AbsoluteFill>
  );
};

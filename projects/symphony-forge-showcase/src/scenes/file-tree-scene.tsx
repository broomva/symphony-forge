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
import { fileTree } from "../data/content";

export const FileTreeScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <GradientBg />
      <BokehParticles count={10} />

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
          text="Generated File Tree"
        />
        <div style={{ height: 8 }} />
        <WordReveal
          color="#556677"
          delay={8}
          fontSize={22}
          fontWeight={400}
          text="All layers installed with `symphony-forge layer all`"
        />
        <div style={{ height: 32 }} />

        <div
          style={{
            flex: 1,
            background: "rgba(0, 31, 63, 0.3)",
            border: "1px solid rgba(0, 102, 255, 0.08)",
            borderRadius: 16,
            padding: "24px 32px",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 4,
            overflow: "hidden",
          }}
        >
          {fileTree.map((item, i) => (
            <FileTreeRow
              key={`${item.indent}-${item.path}`}
              {...item}
              index={i}
            />
          ))}
        </div>
      </AbsoluteFill>

      <Vignette intensity={0.4} />
    </AbsoluteFill>
  );
};

const FileTreeRow: React.FC<{
  path: string;
  indent: number;
  color: string;
  index: number;
}> = ({ path, indent, color, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = 15 + index * 3;
  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [10, 0]);
  const blur = interpolate(entrance, [0, 0.4], [3, 0], {
    extrapolateRight: "clamp",
  });

  const isDir = path.endsWith("/");
  const icon = isDir ? "\uD83D\uDCC1" : "\uD83D\uDCC4";

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        filter: `blur(${blur}px)`,
        paddingLeft: indent * 28,
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 20,
        color: isDir ? color : "#8899AA",
        fontWeight: isDir ? 600 : 400,
        lineHeight: 1.8,
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      {path}
    </div>
  );
};

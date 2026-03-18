import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BokehParticles } from "../components/bokeh-particles";
import { GradientBg } from "../components/gradient-bg";
import { TerminalWindow } from "../components/terminal-window";
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
          alignItems: "center",
          padding: "50px 60px",
        }}
      >
        <WordReveal
          color="#FFFFFF"
          delay={0}
          fontSize={40}
          text="What gets generated"
        />
        <div style={{ height: 24 }} />

        {/* File tree inside editor-style window */}
        <TerminalWindow
          delay={8}
          title="my-project \u2014 File Explorer"
          width={700}
        >
          {fileTree.map((item, i) => (
            <TreeLine key={`${item.indent}-${item.path}`} {...item} index={i} />
          ))}
        </TerminalWindow>
      </AbsoluteFill>

      <Vignette intensity={0.4} />
    </AbsoluteFill>
  );
};

const TreeLine: React.FC<{
  color: string;
  indent: number;
  index: number;
  path: string;
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
  const translateX = interpolate(entrance, [0, 1], [15, 0]);

  const isDir = path.endsWith("/");
  const icon = isDir ? "\uD83D\uDCC1" : "\uD83D\uDCC4";

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
        paddingLeft: indent * 24,
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontSize: 17,
        color: isDir ? color : "#7B8FA0",
        fontWeight: isDir ? 600 : 400,
        lineHeight: 1.9,
      }}
    >
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ textShadow: isDir ? `0 0 12px ${color}30` : "none" }}>
        {path}
      </span>
    </div>
  );
};

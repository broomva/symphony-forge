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
import { commands } from "../data/content";

export const CommandsScene: React.FC = () => {
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
          text="CLI Commands"
        />
        <div style={{ height: 12 }} />
        <WordReveal
          color="#556677"
          delay={5}
          fontSize={22}
          fontWeight={400}
          text="One tool, four workflows"
        />
        <div style={{ height: 48 }} />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 24,
            justifyContent: "center",
          }}
        >
          {commands.map((cmd, i) => (
            <GlassCommandRow
              cmd={cmd.cmd}
              description={cmd.description}
              index={i}
              key={cmd.cmd}
            />
          ))}
        </div>
      </AbsoluteFill>

      <Vignette intensity={0.4} />
    </AbsoluteFill>
  );
};

const GlassCommandRow: React.FC<{
  cmd: string;
  description: string;
  index: number;
}> = ({ cmd, description, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = 12 + index * 12;
  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 28, mass: 1, overshootClamping: true, stiffness: 120 },
  });
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateX = interpolate(entrance, [0, 1], [-40, 0]);
  const blur = interpolate(entrance, [0, 0.4], [3, 0], {
    extrapolateRight: "clamp",
  });

  // Typing effect
  const typeStart = delay + 8;
  const typeProgress = interpolate(frame - typeStart, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const visibleChars = Math.floor(typeProgress * cmd.length);
  const displayedCmd = cmd.slice(0, visibleChars);
  const showCursor = typeProgress < 1;
  const cursorBlink = Math.floor(frame / 15) % 2 === 0;

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
        filter: `blur(${blur}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 26,
          color: "#66BBFF",
          background: "rgba(0, 102, 255, 0.04)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(0, 102, 255, 0.10)",
          borderRadius: 14,
          padding: "16px 24px",
          marginBottom: 8,
          boxShadow:
            "0 8px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
        }}
      >
        <span style={{ color: "#4A5568" }}>$ </span>
        {displayedCmd}
        {showCursor && (
          <span style={{ color: "#0066FF", opacity: cursorBlink ? 1 : 0 }}>
            |
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: 17,
          color: "#556677",
          fontFamily: "'Poppins', sans-serif",
          paddingLeft: 24,
        }}
      >
        {description}
      </div>
    </div>
  );
};

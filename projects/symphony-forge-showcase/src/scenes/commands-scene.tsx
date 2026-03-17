import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimatedText } from "../components/animated-text";
import { commands } from "../data/content";

export const CommandsScene: React.FC = () => {
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
        text="CLI Commands"
      />
      <div style={{ height: 8 }} />
      <AnimatedText
        color="#64748B"
        delay={8}
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
          <CommandRow
            cmd={cmd.cmd}
            description={cmd.description}
            index={i}
            key={cmd.cmd}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const CommandRow: React.FC<{
  cmd: string;
  description: string;
  index: number;
}> = ({ cmd, description, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = 15 + index * 10;
  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateX = interpolate(entrance, [0, 1], [-30, 0]);

  // Typing effect for the command
  const typeProgress = interpolate(frame - delay - 5, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const visibleChars = Math.floor(typeProgress * cmd.length);
  const displayedCmd = cmd.slice(0, visibleChars);
  const cursor = typeProgress < 1 ? "\u2588" : "";

  return (
    <div style={{ opacity, transform: `translateX(${translateX}px)` }}>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 26,
          color: "#A5F3FC",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12,
          padding: "16px 24px",
          marginBottom: 8,
        }}
      >
        <span style={{ color: "#6B7280" }}>$ </span>
        {displayedCmd}
        <span style={{ color: "#8B5CF6", animation: "blink 1s infinite" }}>
          {cursor}
        </span>
      </div>
      <div
        style={{
          fontSize: 18,
          color: "#64748B",
          fontFamily: "'Inter', sans-serif",
          paddingLeft: 24,
        }}
      >
        {description}
      </div>
    </div>
  );
};

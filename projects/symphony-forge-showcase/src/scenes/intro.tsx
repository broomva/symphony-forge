import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimatedText } from "../components/animated-text";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const glowScale = spring({ frame, fps, config: { damping: 200 } });
  const glowOpacity = interpolate(glowScale, [0, 1], [0, 0.6]);

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(135deg, #0F0A1A 0%, #1A0A2E 50%, #0F172A 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 60,
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, #8B5CF640 0%, transparent 70%)",
          opacity: glowOpacity,
          transform: `scale(${glowScale})`,
        }}
      />

      {/* Anvil icon */}
      <div style={{ marginBottom: 24 }}>
        <AnimatedText delay={5} fontSize={80} text={"\u2692"} />
      </div>

      <AnimatedText
        color="#E2E8F0"
        delay={10}
        fontSize={64}
        text="symphony-forge"
      />

      <div style={{ height: 16 }} />

      <AnimatedText
        color="#8B5CF6"
        delay={20}
        fontSize={32}
        fontWeight={500}
        text="Composable control metalayer"
      />

      <AnimatedText
        color="#8B5CF6"
        delay={25}
        fontSize={32}
        fontWeight={500}
        text="for next-forge projects"
      />

      <div style={{ height: 40 }} />

      {/* Stat pills */}
      <div style={{ display: "flex", gap: 20 }}>
        {[
          { label: "Layers", value: "5", delay: 35 },
          { label: "Files", value: "30+", delay: 40 },
          { label: "Agents", value: "42+", delay: 45 },
        ].map((stat) => (
          <StatPill key={stat.label} {...stat} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const StatPill: React.FC<{ label: string; value: string; delay: number }> = ({
  label,
  value,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 200 },
  });
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const scale = interpolate(entrance, [0, 1], [0.8, 1]);

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        background: "rgba(139, 92, 246, 0.12)",
        border: "1px solid rgba(139, 92, 246, 0.3)",
        borderRadius: 40,
        padding: "12px 28px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <span style={{ fontSize: 28, fontWeight: 800, color: "#C4B5FD" }}>
        {value}
      </span>
      <span style={{ fontSize: 16, color: "#94A3B8" }}>{label}</span>
    </div>
  );
};

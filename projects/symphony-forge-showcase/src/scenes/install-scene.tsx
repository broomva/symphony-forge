import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimatedText } from "../components/animated-text";

export const InstallScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeEntrance = spring({
    frame: frame - 50,
    fps,
    config: { damping: 20, stiffness: 200 },
  });
  const badgeOpacity = interpolate(badgeEntrance, [0, 1], [0, 1]);
  const badgeScale = interpolate(badgeEntrance, [0, 1], [0.8, 1]);

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
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, #8B5CF620 0%, transparent 70%)",
        }}
      />

      <AnimatedText
        color="#E2E8F0"
        delay={0}
        fontSize={52}
        text="Get Started"
      />

      <div style={{ height: 40 }} />

      {/* npm install command */}
      <div style={{ width: "100%", maxWidth: 800 }}>
        <AnimatedText
          color="#64748B"
          delay={10}
          fontSize={20}
          fontWeight={400}
          text="New project:"
        />
        <div style={{ height: 8 }} />
        <CommandBox delay={15} text="npx symphony-forge init my-app" />

        <div style={{ height: 28 }} />

        <AnimatedText
          color="#64748B"
          delay={25}
          fontSize={20}
          fontWeight={400}
          text="Existing project:"
        />
        <div style={{ height: 8 }} />
        <CommandBox delay={30} text="npx symphony-forge layer all" />

        <div style={{ height: 28 }} />

        <AnimatedText
          color="#64748B"
          delay={40}
          fontSize={20}
          fontWeight={400}
          text="Agent skill:"
        />
        <div style={{ height: 8 }} />
        <CommandBox delay={45} text="npx skills add broomva/symphony-forge" />
      </div>

      <div style={{ height: 48 }} />

      {/* Badges */}
      <div
        style={{
          display: "flex",
          gap: 16,
          opacity: badgeOpacity,
          transform: `scale(${badgeScale})`,
        }}
      >
        {["Apache 2.0", "TypeScript", "42+ Agents"].map((label) => (
          <div
            key={label}
            style={{
              background: "rgba(139, 92, 246, 0.12)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              borderRadius: 40,
              padding: "8px 20px",
              fontSize: 16,
              color: "#C4B5FD",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
            }}
          >
            {label}
          </div>
        ))}
      </div>

      <div style={{ height: 32 }} />

      <div
        style={{
          opacity: badgeOpacity,
          fontSize: 20,
          color: "#64748B",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        github.com/broomva/symphony-forge
      </div>
    </AbsoluteFill>
  );
};

const CommandBox: React.FC<{ text: string; delay: number }> = ({
  text,
  delay,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateX = interpolate(entrance, [0, 1], [-20, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 26,
        color: "#A5F3FC",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "14px 24px",
      }}
    >
      <span style={{ color: "#6B7280" }}>$ </span>
      {text}
    </div>
  );
};

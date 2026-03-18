import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BokehParticles } from "../components/bokeh-particles";
import { GradientBg } from "../components/gradient-bg";
import { LightSweep } from "../components/light-sweep";
import { Vignette } from "../components/vignette";
import { WordReveal } from "../components/word-reveal";

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
    <AbsoluteFill>
      <GradientBg />
      <BokehParticles count={20} />

      <AbsoluteFill
        style={{
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
            background:
              "radial-gradient(circle, #0066FF20 0%, transparent 70%)",
          }}
        />

        <LightSweep>
          <WordReveal
            color="#FFFFFF"
            delay={0}
            fontSize={52}
            text="Get Started"
          />
        </LightSweep>

        <div style={{ height: 40 }} />

        {/* npm install command */}
        <div style={{ width: "100%", maxWidth: 800 }}>
          <WordReveal
            color="#556677"
            delay={10}
            fontSize={20}
            fontWeight={400}
            text="New project:"
          />
          <div style={{ height: 8 }} />
          <CommandBox delay={15} text="npx symphony-forge init my-app" />

          <div style={{ height: 28 }} />

          <WordReveal
            color="#556677"
            delay={25}
            fontSize={20}
            fontWeight={400}
            text="Existing project:"
          />
          <div style={{ height: 8 }} />
          <CommandBox delay={30} text="npx symphony-forge layer all" />

          <div style={{ height: 28 }} />

          <WordReveal
            color="#556677"
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
                background: "rgba(0, 102, 255, 0.10)",
                border: "1px solid rgba(0, 102, 255, 0.25)",
                borderRadius: 40,
                padding: "8px 20px",
                fontSize: 16,
                color: "#66BBFF",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 500,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
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
            color: "#556677",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          github.com/broomva/symphony-forge
        </div>
      </AbsoluteFill>

      <Vignette intensity={0.4} />
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
  const blur = interpolate(entrance, [0, 0.4], [3, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
        filter: `blur(${blur}px)`,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 26,
        color: "#66BBFF",
        background: "rgba(0, 102, 255, 0.05)",
        border: "1px solid rgba(0, 102, 255, 0.12)",
        borderRadius: 12,
        padding: "14px 24px",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow:
          "0 8px 24px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.04)",
      }}
    >
      <span style={{ color: "#4A5568" }}>$ </span>
      {text}
    </div>
  );
};

import {
  AbsoluteFill,
  Easing,
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

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Hero scale-up entrance
  const heroProgress = spring({
    frame,
    fps,
    config: { damping: 28, mass: 2, overshootClamping: true, stiffness: 80 },
    durationInFrames: 45,
  });
  const heroScale = interpolate(heroProgress, [0, 1], [0.7, 1]);
  const heroOpacity = interpolate(heroProgress, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });
  const heroBlur = interpolate(heroProgress, [0, 0.5], [8, 0], {
    extrapolateRight: "clamp",
  });

  // Glow pulse
  const glowPulse = 0.5 + Math.sin(frame * 0.03) * 0.15;

  // Ken Burns slow zoom on entire scene
  const kenBurns = interpolate(frame, [0, 180], [1, 1.06], {
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });

  return (
    <AbsoluteFill>
      <GradientBg />
      <BokehParticles count={25} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 60,
          transform: `scale(${kenBurns})`,
        }}
      >
        {/* Central glow orb */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, #0066FF25 0%, #00CC6610 40%, transparent 70%)",
            opacity: glowPulse,
          }}
        />

        {/* Hero content with scale-up entrance */}
        <div
          style={{
            opacity: heroOpacity,
            transform: `scale(${heroScale})`,
            filter: `blur(${heroBlur}px)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Anvil icon with light sweep */}
          <LightSweep delay={25}>
            <div
              style={{
                fontSize: 80,
                marginBottom: 24,
                textShadow: "0 0 40px #0066FF60",
              }}
            >
              {"\u2692"}
            </div>
          </LightSweep>

          {/* Title */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#FFFFFF",
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: "-0.02em",
              textShadow: "0 0 30px #0066FF30",
            }}
          >
            symphony-forge
          </div>

          <div style={{ height: 20 }} />

          {/* Subtitle with word-by-word reveal */}
          <WordReveal
            color="#0066FF"
            delay={20}
            fontSize={32}
            fontWeight={500}
            text="Composable control metalayer for next-forge projects"
          />
        </div>

        <div style={{ height: 48 }} />

        {/* Glass stat pills */}
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { label: "Layers", value: "5", delay: 40 },
            { label: "Files", value: "30+", delay: 46 },
            { label: "Agents", value: "42+", delay: 52 },
          ].map((stat) => (
            <GlassPill key={stat.label} {...stat} />
          ))}
        </div>
      </AbsoluteFill>

      <Vignette intensity={0.5} />
    </AbsoluteFill>
  );
};

const GlassPill: React.FC<{
  delay: number;
  label: string;
  value: string;
}> = ({ label, value, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, overshootClamping: true, stiffness: 200 },
  });
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const scale = interpolate(entrance, [0, 1], [0.85, 1]);
  const blur = interpolate(entrance, [0, 0.5], [3, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
        filter: `blur(${blur}px)`,
        background: "rgba(0, 102, 255, 0.08)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(0, 102, 255, 0.20)",
        borderRadius: 40,
        padding: "12px 28px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "'Poppins', sans-serif",
        boxShadow:
          "0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
      }}
    >
      <span style={{ fontSize: 28, fontWeight: 800, color: "#66BBFF" }}>
        {value}
      </span>
      <span style={{ fontSize: 16, color: "#8899AA" }}>{label}</span>
    </div>
  );
};

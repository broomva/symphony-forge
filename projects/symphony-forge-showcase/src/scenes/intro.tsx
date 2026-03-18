import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BokehParticles } from "../components/bokeh-particles";
import { Counter } from "../components/counter";
import { GradientBg } from "../components/gradient-bg";
import { GradientText } from "../components/gradient-text";
import { LightSweep } from "../components/light-sweep";
import { Vignette } from "../components/vignette";

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Hero scale-up from center
  const heroProgress = spring({
    frame,
    fps,
    config: {
      damping: 28,
      mass: 2,
      overshootClamping: true,
      stiffness: 80,
    },
    durationInFrames: 45,
  });
  const heroScale = interpolate(heroProgress, [0, 1], [0.6, 1]);
  const heroOpacity = interpolate(heroProgress, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });
  const heroBlur = interpolate(heroProgress, [0, 0.5], [10, 0], {
    extrapolateRight: "clamp",
  });

  // Glow pulse
  const glowPulse = 0.5 + Math.sin(frame * 0.03) * 0.15;

  // Ken Burns
  const kenBurns = interpolate(frame, [0, 180], [1, 1.08], {
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  });

  return (
    <AbsoluteFill>
      <GradientBg />
      <BokehParticles count={30} />

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
        {/* Central glow orbs */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, #0066FF20 0%, transparent 60%)",
            opacity: glowPulse,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, #00CC6615 0%, transparent 60%)",
            opacity: glowPulse,
            transform: "translate(100px, -50px)",
          }}
        />

        {/* Hero content */}
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
          {/* Anvil with light sweep */}
          <LightSweep delay={25}>
            <div
              style={{
                fontSize: 90,
                marginBottom: 16,
                textShadow: "0 0 50px #0066FF50",
              }}
            >
              {"\u2692"}
            </div>
          </LightSweep>

          {/* Gradient title */}
          <GradientText
            delay={8}
            fontSize={72}
            from="#0066FF"
            text="symphony-forge"
            to="#00CC66"
          />

          <div style={{ height: 24 }} />

          {/* Subtitle */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: "#8899AA",
              fontFamily: "'Poppins', sans-serif",
              textAlign: "center",
              opacity: interpolate(frame - 20, [0, 15], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            Composable control metalayer for next-forge
          </div>
        </div>

        <div style={{ height: 56 }} />

        {/* Stat counters */}
        <div style={{ display: "flex", gap: 60, alignItems: "center" }}>
          <StatBlock
            color="#0066FF"
            delay={35}
            label="Layers"
            suffix=""
            value={5}
          />
          <StatBlock
            color="#00CC66"
            delay={40}
            label="Files Generated"
            suffix="+"
            value={30}
          />
          <StatBlock
            color="#3399FF"
            delay={45}
            label="AI Agents"
            suffix="+"
            value={42}
          />
        </div>
      </AbsoluteFill>

      <Vignette intensity={0.55} />
    </AbsoluteFill>
  );
};

const StatBlock: React.FC<{
  color: string;
  delay: number;
  label: string;
  suffix: string;
  value: number;
}> = ({ color, delay, label, suffix, value }) => {
  return (
    <div style={{ textAlign: "center" }}>
      <Counter
        color={color}
        delay={delay}
        fontSize={56}
        suffix={suffix}
        value={value}
      />
      <div
        style={{
          fontSize: 14,
          color: "#556677",
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 500,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
  );
};

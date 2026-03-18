import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BokehParticles } from "../components/bokeh-particles";
import { GradientBg } from "../components/gradient-bg";
import { GradientText } from "../components/gradient-text";
import { LightSweep } from "../components/light-sweep";
import { TerminalWindow } from "../components/terminal-window";
import { TypedLine } from "../components/typed-line";
import { Vignette } from "../components/vignette";

export const InstallScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeEntrance = spring({
    frame: frame - 70,
    fps,
    config: { damping: 20, overshootClamping: true, stiffness: 200 },
  });
  const badgeOpacity = interpolate(badgeEntrance, [0, 1], [0, 1]);
  const badgeScale = interpolate(badgeEntrance, [0, 1], [0.85, 1]);

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
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, #0066FF15 0%, #00CC6608 40%, transparent 65%)",
          }}
        />

        <LightSweep delay={15}>
          <GradientText
            delay={0}
            fontSize={56}
            from="#0066FF"
            text="Get Started"
            to="#00CC66"
          />
        </LightSweep>

        <div style={{ height: 36 }} />

        {/* Terminal with install commands */}
        <TerminalWindow delay={10} title="Terminal" width={750}>
          <div style={{ marginBottom: 4, color: "#556677", fontSize: 14 }}>
            # New project
          </div>
          <TypedLine
            color="#66BBFF"
            delay={20}
            prefix="$ "
            prefixColor="#4A5568"
            speed={1}
            text="npx symphony-forge init my-app"
          />

          <div style={{ height: 16 }} />

          <div style={{ marginBottom: 4, color: "#556677", fontSize: 14 }}>
            # Existing project
          </div>
          <TypedLine
            color="#66BBFF"
            delay={45}
            prefix="$ "
            prefixColor="#4A5568"
            speed={1}
            text="npx symphony-forge layer all"
          />

          <div style={{ height: 16 }} />

          <div style={{ marginBottom: 4, color: "#556677", fontSize: 14 }}>
            # Agent skill (42+ agents)
          </div>
          <TypedLine
            color="#00CC66"
            delay={65}
            prefix="$ "
            prefixColor="#4A5568"
            speed={1}
            text="npx skills add broomva/symphony-forge"
          />
        </TerminalWindow>

        <div style={{ height: 36 }} />

        {/* Badges */}
        <div
          style={{
            display: "flex",
            gap: 14,
            opacity: badgeOpacity,
            transform: `scale(${badgeScale})`,
          }}
        >
          {["Apache 2.0", "TypeScript", "42+ Agents", "4 Package Managers"].map(
            (label) => (
              <div
                key={label}
                style={{
                  background: "rgba(0, 102, 255, 0.06)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(0, 102, 255, 0.15)",
                  borderRadius: 40,
                  padding: "8px 18px",
                  fontSize: 14,
                  color: "#66BBFF",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 500,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                }}
              >
                {label}
              </div>
            )
          )}
        </div>

        <div style={{ height: 20 }} />

        <div
          style={{
            opacity: badgeOpacity,
            fontSize: 18,
            color: "#4A5C6B",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 400,
          }}
        >
          github.com/broomva/symphony-forge
        </div>
      </AbsoluteFill>

      <Vignette intensity={0.5} />
    </AbsoluteFill>
  );
};

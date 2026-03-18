import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BokehParticles } from "../components/bokeh-particles";
import { GradientBg } from "../components/gradient-bg";
import { TerminalWindow } from "../components/terminal-window";
import { TypedLine } from "../components/typed-line";
import { Vignette } from "../components/vignette";
import { WordReveal } from "../components/word-reveal";

export const CommandsScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <GradientBg />
      <BokehParticles count={12} />

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
          text="One command. Full scaffold."
        />
        <div style={{ height: 32 }} />

        {/* Terminal mockup showing actual CLI output */}
        <TerminalWindow delay={10} title={"~/my-project — zsh"} width={880}>
          <TypedLine
            color="#66BBFF"
            delay={18}
            prefix="$ "
            prefixColor="#4A5568"
            speed={1.2}
            text="npx symphony-forge layer all --force"
          />

          <div style={{ height: 12 }} />

          {/* CLI output lines */}
          <OutputLine
            color="#8899AA"
            delay={50}
            text={"┌  Symphony Forge — Layer Manager"}
          />
          <OutputLine color="#8899AA" delay={58} text={"│"} />
          <OutputLine
            color="#00CC66"
            delay={65}
            text={"◇  Installed 27 files."}
          />
          <OutputLine color="#8899AA" delay={72} text={"│"} />
          <OutputLine
            color="#3399FF"
            delay={78}
            text={
              "●  Layers: control, harness, knowledge, consciousness, autoany"
            }
          />
          <OutputLine color="#8899AA" delay={85} text={"│"} />
          <OutputLine color="#556677" delay={90} text={"●  Files written:"} />
          <FileOutput
            color="#0066FF"
            delay={95}
            text="    .control/policy.yaml"
          />
          <FileOutput
            color="#0066FF"
            delay={98}
            text="    .control/commands.yaml"
          />
          <FileOutput
            color="#00CC66"
            delay={101}
            text="    scripts/harness/smoke.sh"
          />
          <FileOutput
            color="#00CC66"
            delay={104}
            text="    scripts/harness/ci.sh"
          />
          <FileOutput color="#34C759" delay={107} text="    docs/_index.md" />
          <FileOutput color="#3399FF" delay={110} text="    CLAUDE.md" />
          <FileOutput color="#3399FF" delay={113} text="    AGENTS.md" />
          <FileOutput
            color="#FF3B30"
            delay={116}
            text="    .control/egri.yaml"
          />
          <OutputLine color="#556677" delay={119} text="    ... and 19 more" />
          <OutputLine color="#8899AA" delay={125} text={"│"} />
          <OutputLine
            color="#00CC66"
            delay={130}
            text={"└  Layer installation complete."}
          />
        </TerminalWindow>
      </AbsoluteFill>

      <Vignette intensity={0.45} />
    </AbsoluteFill>
  );
};

const OutputLine: React.FC<{ color: string; delay: number; text: string }> = ({
  color,
  delay,
  text,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return <div style={{ opacity, color, lineHeight: 1.6 }}>{text}</div>;
};

const FileOutput: React.FC<{ color: string; delay: number; text: string }> = ({
  color,
  delay,
  text,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame - delay, [0, 3], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ opacity, color, lineHeight: 1.5, fontSize: 15 }}>{text}</div>
  );
};

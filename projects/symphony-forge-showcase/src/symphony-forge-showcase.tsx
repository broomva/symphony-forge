import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { CommandsScene } from "./scenes/commands-scene";
import { FileTreeScene } from "./scenes/file-tree-scene";
import { InstallScene } from "./scenes/install-scene";
import { Intro } from "./scenes/intro";
import { LayersScene } from "./scenes/layers-scene";
import { MetalayerScene } from "./scenes/metalayer-scene";

// Timeline (frames at 30fps):
// Intro:          150 frames (5.0s)
//   ↕ crossfade 25 frames
// Layers:         210 frames (7.0s)
//   ↕ slide-right 20 frames
// Commands:       180 frames (6.0s)
//   ↕ crossfade 25 frames
// Metalayer:      180 frames (6.0s)
//   ↕ slide-right 20 frames
// File Tree:      180 frames (6.0s)
//   ↕ crossfade 25 frames
// Install/CTA:    150 frames (5.0s)
// Transitions overlap, so total ≈ 1050 - (25+20+25+20+25) = 935 net frames (~31s)

const CROSSFADE = 25;
const SLIDE = 20;

export const SymphonyForgeShowcase: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={150}>
        <Intro />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: CROSSFADE })}
      />

      <TransitionSeries.Sequence durationInFrames={210}>
        <LayersScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: SLIDE })}
      />

      <TransitionSeries.Sequence durationInFrames={180}>
        <CommandsScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: CROSSFADE })}
      />

      <TransitionSeries.Sequence durationInFrames={180}>
        <MetalayerScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: SLIDE })}
      />

      <TransitionSeries.Sequence durationInFrames={180}>
        <FileTreeScene />
      </TransitionSeries.Sequence>

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: CROSSFADE })}
      />

      <TransitionSeries.Sequence durationInFrames={150}>
        <InstallScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

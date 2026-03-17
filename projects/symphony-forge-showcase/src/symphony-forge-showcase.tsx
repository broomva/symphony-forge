import { Series } from "remotion";
import { CommandsScene } from "./scenes/commands-scene";
import { FileTreeScene } from "./scenes/file-tree-scene";
import { InstallScene } from "./scenes/install-scene";
import { Intro } from "./scenes/intro";
import { LayersScene } from "./scenes/layers-scene";
import { MetalayerScene } from "./scenes/metalayer-scene";

// Timeline (frames at 30fps):
// Intro:          150 frames (5.0s)
// Layers:         210 frames (7.0s)
// Commands:       180 frames (6.0s)
// Metalayer:      180 frames (6.0s)
// File Tree:      180 frames (6.0s)
// Install/CTA:    150 frames (5.0s)
// Total:         1050 frames (35.0s)

export const SymphonyForgeShowcase: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={150}>
        <Intro />
      </Series.Sequence>

      <Series.Sequence durationInFrames={210}>
        <LayersScene />
      </Series.Sequence>

      <Series.Sequence durationInFrames={180}>
        <CommandsScene />
      </Series.Sequence>

      <Series.Sequence durationInFrames={180}>
        <MetalayerScene />
      </Series.Sequence>

      <Series.Sequence durationInFrames={180}>
        <FileTreeScene />
      </Series.Sequence>

      <Series.Sequence durationInFrames={150}>
        <InstallScene />
      </Series.Sequence>
    </Series>
  );
};

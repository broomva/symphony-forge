import { Composition } from "remotion";
import { SymphonyForgeShowcase } from "./symphony-forge-showcase";

// 30fps * 35s = 1050 frames
export const RemotionRoot = () => {
  return (
    <Composition
      component={SymphonyForgeShowcase}
      durationInFrames={1050}
      fps={30}
      height={1080}
      id="SymphonyForgeShowcase"
      width={1080}
    />
  );
};

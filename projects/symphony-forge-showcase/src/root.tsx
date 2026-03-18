import { Composition } from "remotion";
import { SymphonyForgeShowcase } from "./symphony-forge-showcase";

// 1050 scene frames - 115 overlap frames = 935 net (~31s at 30fps)
export const RemotionRoot = () => {
  return (
    <Composition
      component={SymphonyForgeShowcase}
      durationInFrames={935}
      fps={30}
      height={1080}
      id="SymphonyForgeShowcase"
      width={1080}
    />
  );
};

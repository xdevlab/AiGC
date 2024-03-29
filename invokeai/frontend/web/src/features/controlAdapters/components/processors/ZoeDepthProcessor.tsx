import type { RequiredZoeDepthImageProcessorInvocation } from 'features/controlAdapters/store/types';
import { memo } from 'react';

type Props = {
  controlNetId: string;
  processorNode: RequiredZoeDepthImageProcessorInvocation;
  isEnabled: boolean;
};

const ZoeDepthProcessor = (_props: Props) => {
  // Has no parameters?
  return null;
};

export default memo(ZoeDepthProcessor);

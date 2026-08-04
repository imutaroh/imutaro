import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* dev 時の左下インジケータ（黒丸 N）がスクリーンショット証跡に写り込むため無効化 */
  devIndicators: false,
};

export default nextConfig;

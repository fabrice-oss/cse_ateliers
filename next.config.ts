import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  outputFileTracingExcludes: { '/api/quiz-*/**': ['./.quiz-data/**/*'] },
};

export default nextConfig;

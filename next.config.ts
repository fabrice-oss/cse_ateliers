import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  outputFileTracingExcludes: { '/api/quiz-1/**': ['./.quiz-data/**/*'] },
};

export default nextConfig;

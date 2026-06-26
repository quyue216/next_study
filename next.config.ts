import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['169.254.83.107', '100.86.109.101','100.75.110.115'],
  async rewrites() {
    return [
      {
        // 访问 /tasks 时，内部映射到 /todos 渲染
        source: '/tasks',
        destination: '/todos',
      },
    ]
  },
};

export default nextConfig;

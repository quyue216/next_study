import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

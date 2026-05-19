import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  sassOptions: {
    // Permite usar @use 'variables' as *; desde cualquier módulo SCSS.
    includePaths: [path.join(process.cwd(), 'src/styles')],
  },
};

export default nextConfig;

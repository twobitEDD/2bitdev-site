/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Suppress warnings for optional dependencies (bufferutil, utf-8-validate)
    // These are optional performance enhancements for WebSocket connections in the 'ws' package
    // They're not needed for browser builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        bufferutil: false,
        "utf-8-validate": false,
      };
      
      // Ignore these modules when bundling for browser
      config.externals = config.externals || [];
      config.externals.push({
        bufferutil: "commonjs bufferutil",
        "utf-8-validate": "commonjs utf-8-validate",
      });
    }
    
    // Suppress the specific module resolution warnings
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /node_modules\/ws\/lib/,
        message: /Can't resolve '(bufferutil|utf-8-validate)'/,
      },
    ];
    
    return config;
  },
};

module.exports = nextConfig;

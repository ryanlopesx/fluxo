/** @type {import('next').NextConfig} */
const nextConfig = {
  // Módulos que não devem ser bundlados pelo webpack (usam APIs nativas do Node.js)
  serverExternalPackages: ['instagram-private-api'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // node:sqlite é built-in do Node.js v22+, não precisa de bundling
      config.externals = [...(config.externals || []), 'node:sqlite']
    }
    return config
  }
}

export default nextConfig

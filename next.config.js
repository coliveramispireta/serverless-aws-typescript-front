/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', 
  trailingSlash: true, 
   env: {
    APP_ENV: process.env.APP_ENV || 'development',
  },
  reactStrictMode: false, //Si se tiene en true, se va a llamar dos veces al hook de useEffect
  productionBrowserSourceMaps: false,
   // Optional: Add a trailing slash to all paths `/about` -> `/about/`
  trailingSlash: false,
  exportPathMap: async function (
    defaultPathMap,
    { dev, dir, outDir, distDir, buildId }
  ) {
    return {
      '/': { page: '/' },
      '/login': { page: '/login' },
      '/about': { page: '/about' },
    }
  },
   // Optional: Change the output directory `out` -> `dist`
   // distDir: 'dist',

   webpack: (config) => {
     config.externals = [...config.externals, { canvas: "canvas" }];  // required to make Konva & react-konva work
     return config;
   }
 };
  

module.exports = nextConfig

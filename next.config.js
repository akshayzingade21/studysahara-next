/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Only keep path-level legacy redirects (no host canonicalization here).
  async redirects() {
    return [
      // Legacy home
      { source: '/index.html', destination: '/', permanent: true },

      // Legacy lender slugs → current final slugs
      { source: '/icici-bank', destination: '/icicibank', permanent: true },
      { source: '/axis-bank', destination: '/axisbank', permanent: true },
      { source: '/idfc-first-bank', destination: '/idfc', permanent: true },
      { source: '/union-bank', destination: '/unionbank', permanent: true },
      { source: '/punjab-national-bank', destination: '/pnb', permanent: true },
      { source: '/yes-bank', destination: '/yesbank', permanent: true },
      { source: '/tata-capital', destination: '/tatacapital', permanent: true },
      { source: '/prodigy-finance', destination: '/prodigyfinance', permanent: true },
      { source: '/poonawalla-fincorp', destination: '/poonawallafincorp', permanent: true },
      { source: '/mpower-financing', destination: '/mpowerfinancing', permanent: true },
      { source: '/avanse-financial-services', destination: '/avanse', permanent: true },
      { source: '/sallie-mae', destination: '/salliemae', permanent: true },

      // Legacy about
      { source: '/our-company-studysahara', destination: '/ourcompany', permanent: true },

      // Case variant seen by Google once
      { source: '/PNB', destination: '/pnb', permanent: true },
    ];
  },
};

module.exports = nextConfig;
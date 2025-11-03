/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // ✅ Normalize host to www
     {
  source: '/:path*',
  has: [
    { type: 'host', value: 'studysahara.com' },       // only non-www domain
  ],
  missing: [
    { type: 'host', value: 'www.studysahara.com' },   // skip redirect if already www
  ],
  destination: 'https://www.studysahara.com/:path*',
  permanent: true,
},
      // ✅ Remove legacy index.html
      { source: '/index.html', destination: '/', permanent: true },

      // ✅ Legacy lender slugs → final slugs (avoid hyphens)
      { source: '/icici-bank', destination: '/icicibank', permanent: true },
      { source: '/idfc-first-bank', destination: '/idfc', permanent: true },
      { source: '/union-bank', destination: '/unionbank', permanent: true },
      { source: '/punjab-national-bank', destination: '/pnb', permanent: true },
      { source: '/axis-bank', destination: '/axisbank', permanent: true },
      { source: '/yes-bank', destination: '/yesbank', permanent: true },
      { source: '/tata-capital', destination: '/tatacapital', permanent: true },
      { source: '/prodigy-finance', destination: '/prodigyfinance', permanent: true },
      { source: '/poonawalla-fincorp', destination: '/poonawallafincorp', permanent: true },
      { source: '/mpower-financing', destination: '/mpowerfinancing', permanent: true },
      { source: '/avanse-financial-services', destination: '/avanse', permanent: true },
      { source: '/sallie-mae', destination: '/salliemae', permanent: true },

      // ✅ Legacy about route
      { source: '/our-company-studysahara', destination: '/ourcompany', permanent: true },

      // ✅ Common mistakes / uppercase
      { source: '/PNB', destination: '/pnb', permanent: true },
    ];
  },
};

module.exports = nextConfig;

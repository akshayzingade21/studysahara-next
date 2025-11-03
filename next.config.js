/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // ✅ Force HTTPS + www only if the host is exactly "studysahara.com"
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'studysahara.com' }],
        destination: 'https://www.studysahara.com/:path*',
        permanent: true,
      },

      // ✅ Remove this rule if you previously added a second "has" for www
      // (you only want this one)

      // ✅ Keep all your other lender redirects below
      { source: '/index.html', destination: '/', permanent: true },
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
      { source: '/PNB', destination: '/pnb', permanent: true },
      { source: '/our-company-studysahara', destination: '/ourcompany', permanent: true },
    ];
  },
};

module.exports = nextConfig;
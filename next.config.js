/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // 🔁 Example: Redirect from old HTML to new route
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/icici-bank',
        destination: '/icicibank',
        permanent: true,
      },
         {
        source: '/axis-bank',
        destination: '/axisbank',
        permanent: true,
      },
      {
        source: '/avanse-financial-services',
        destination: '/avanse',
        permanent: true,
      },
      {
        source: '/auxilo-finserv',
        destination: '/auxilo',
        permanent: true,
      },
      {
        source: '/union-bank',
        destination: '/unionbank',
        permanent: true,
      },
      {
        source: '/punjab-national-bank',
        destination: '/pnb',
        permanent: true,
      },
      {
        source: '/idfc-first-bank',
        destination: '/idfc',
        permanent: true,
      },
      {
        source: '/yes-bank',
        destination: '/yesbank',
        permanent: true,
      },
      {
        source: '/incred-finance',
        destination: '/incred',
        permanent: true,
      },
      {
        source: '/tata-capital',
        destination: '/tatacapital',
        permanent: true,
      },
      {
        source: '/poonawalla-fincorp',
        destination: '/poonawallafincorp',
        permanent: true,
      },
      {
        source: '/prodigy-finance',
        destination: '/prodigyfinance',
        permanent: true,
      },
      {
        source: '/mpower-financing',
        destination: '/mpowerfinancing',
        permanent: true,
      },
      {
        source: '/sallie-mae',
        destination: '/salliemae',
        permanent: true,
      },
      {
        source: '/no-coapplicant-no-collateral',
        destination: '/no-co-applicant-and-no-collateral',
        permanent: true,
      },
      {
        source: '/coapplicant-no-collateral',
        destination: '/co-applicant-and-no-collateral',
        permanent: true,
      },
      {
        source: '/coapplicant-collateral',
        destination: '/co-applicant-and-collateral',
        permanent: true,
      },
      {
        source: '/us-coapplicant',
        destination: '/us-co-applicant',
        permanent: true,
      },
      {
        source: '/check-loan-eligibility',
        destination: '/eligibility',
        permanent: true,
      },
      {
        source: '/our-company-studysahara',
        destination: '/ourcompany',
        permanent: true,
      }
    ];
  },
};

module.exports = nextConfig;
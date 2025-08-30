/** @type {import('next').NextConfig} */
const isProd = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

const nextConfig = {
  trailingSlash: false,

  async redirects() {
    const common = [
      // Host canonicalization: non-www -> www (prod only via Vercel edge)
      {
        source: "/:path*",
        has: [{ type: "host", value: "studysahara.com" }],
        destination: "https://www.studysahara.com/:path*",
        permanent: true,
      },

      { source: "/index.html", destination: "/", permanent: true },
      { source: "/icici-bank", destination: "/icicibank", permanent: true },
      { source: "/axis-bank", destination: "/axisbank", permanent: true },
      { source: "/avanse-financial-services", destination: "/avanse", permanent: true },
      { source: "/auxilo-finserv", destination: "/auxilo", permanent: true },
      { source: "/union-bank", destination: "/unionbank", permanent: true },
      { source: "/punjab-national-bank", destination: "/pnb", permanent: true },
      { source: "/idfc-first-bank", destination: "/idfc", permanent: true },
      { source: "/yes-bank", destination: "/yesbank", permanent: true },
      { source: "/incred-finance", destination: "/incred", permanent: true },
      { source: "/tata-capital", destination: "/tatacapital", permanent: true },
      { source: "/poonawalla-fincorp", destination: "/poonawallafincorp", permanent: true },
      { source: "/prodigy-finance", destination: "/prodigyfinance", permanent: true },
      { source: "/mpower-financing", destination: "/mpowerfinancing", permanent: true },
      { source: "/sallie-mae", destination: "/salliemae", permanent: true },
      { source: "/no-coapplicant-no-collateral", destination: "/no-co-applicant-and-no-collateral", permanent: true },
      { source: "/coapplicant-no-collateral", destination: "/co-applicant-and-no-collateral", permanent: true },
      { source: "/coapplicant-collateral", destination: "/co-applicant-and-collateral", permanent: true },
      { source: "/us-coapplicant", destination: "/us-co-applicant", permanent: true },
      { source: "/check-loan-eligibility", destination: "/eligibility", permanent: true },
      { source: "/our-company-studysahara", destination: "/ourcompany", permanent: true },
    ];

    // ✅ Only in production: 301 redirect /PNB -> /pnb (canonical)
    const prodOnly = isProd ? [{ source: "/PNB", destination: "/pnb", permanent: true }] : [];

    return [...prodOnly, ...common];
  },

  async rewrites() {
    // ✅ Only in development: silently rewrite /PNB -> /pnb
    if (!isProd) {
      return [{ source: "/PNB", destination: "/pnb" }];
    }
    return [];
  },
};

module.exports = nextConfig;